// R1Q2/daniel
//  - documentation
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Falael.Bic.GameOfLife
{
    public class LifeDocument
    {
        #region Nested types
        public class Configuration
        {
            public GridPoint[] occupiedGridPoints = new GridPoint[] { };
            public bool? wrap = null;
            public int? wrapRadius = null;
        }
        public class Rule
        {
            public Rule(string title, Func<LifeDocument, Cell, bool> test, Action<LifeDocument, Cell> apply)
            {
                this.title = title;
                this.test = test;
                this.apply = apply;
            }

            public string Title
            {
                get
                {
                    return this.title;
                }
            }
            public Func<LifeDocument, Cell, bool> Test
            {
                get
                {
                    return this.test;
                }
            }
            public Action<LifeDocument, Cell> Apply
            {
                get
                {
                    return this.apply;
                }
            }

            public static void ApplyRules(LifeDocument doument, Cell cell, Rule[] rules)
            {
                for (int length = rules.Length, i = 0; i < length; ++i)
                {
                    var rule = rules[i];
                    if (rule.Test(doument, cell))
                    {
                        rule.Apply(doument, cell);
                        return;
                    }
                }
            }

            string title;
            Func<LifeDocument, Cell, bool> test;
            Action<LifeDocument, Cell> apply;
        }
        public struct GridPoint
        {
            public int x;
            public int y;

            public override string ToString()
            {
                return string.Format("({0}, {1})", this.x, this.y);
            }
        }
        public class Cell
        {
            public GridPoint gridPoint;
            public ulong key;
            public int flavor;
            public int futureFlavor;

            public override string ToString()
            {
                return string.Format("{0}:{1} = {2} [{3}]", this.key, this.gridPoint, this.flavor, this.futureFlavor);
            }
        }
        #endregion

        #region Operations
        public void Clear()
        {
            this.cells.Clear();
            this.futureFlavorCells.Clear();
            this.invalidCells.Clear();
            this.neighbourCountHash.Clear();

            this.generation = 0;
            this.generationSize = 0;
            this.memCellCount = 0;
            this.previousMmemCellCount = 0;
            this.activeCellCount = 0;
            this.topLeft = new GridPoint();
            this.bottomRight = new GridPoint();
        }

        public void Reset()
        {
            this.Clear();
            this.SetConfiguration(this.configuration);
        }

        public void SetConfiguration(Configuration configuration)
        {
            this.configuration = configuration;
            this.wrap = configuration.wrap != null ? (bool)configuration.wrap : this.wrap;
            this.wrapRadius = configuration.wrapRadius != null ? (int)configuration.wrapRadius : this.wrapRadius;

            for (int length = configuration.occupiedGridPoints.Length, i = 0; i < length; ++i)
            {
                var gridPoint = configuration.occupiedGridPoints[i];
                var key = GetKey(gridPoint.x, gridPoint.y);
                var cell = new Cell
                {
                    gridPoint = gridPoint,
                    key = key,
                    flavor = ALIVE,
                };
                this.InvalidateNeighbourhood(gridPoint);
                this.cells[key] = cell;
                ++this.generationSize;
                this.invalidCells[key] = cell;
            }
        }

        public void NextGeneration()
        {
            this.NextGeneration(this.rules);
        }

        public void NextGeneration(Rule[] rules)
        {
            if(this.rules != null && !object.ReferenceEquals(rules, this.rules))
            {
                throw new InvalidOperationException("rules");
            }

            DateTime start = DateTime.Now;

            ++this.generation;
            this.activeCellCount = 0;
            this.neighbourCountHash.Clear();

            if (this.memCellCount > this.previousMmemCellCount)
            {
                var recycleFrequency = (int)Math.Ceiling(this.recycleFrequencyUpperBound / (decimal)this.memCellCount);
                if ((this.generation % recycleFrequency) != 0)
                {
                    this.Recycle();
                }
            }

            List<Cell> cells = new List<Cell>(this.invalidCells.Values);
            this.NextGeneration_Partial(rules, cells);

            this.ApplyFutureFlavors();

            this.previousMmemCellCount = this.memCellCount;
            this.memCellCount = this.QueryMemCellCount();

            DateTime end = DateTime.Now;
            this.totalGenerationTime += (long)Math.Round((end.Ticks - start.Ticks) / 10000f);
            //if(this.generation % 10 == 0)
            //{
            //    System.Diagnostics.Debug.WriteLine("Time per generation = {0}ms ({1}, {2}, {3}), cpu count: {4}", this.totalGenerationTime / this.generation, this.totalGenerationTime, this.generation, end - start, Environment.ProcessorCount);
            //}
        }

        public Cell[] QueryOccupiedCells()
        {
            var result = new List<Cell>();

            var enumerator = this.cells.GetEnumerator();
            while (enumerator.MoveNext())
            {
                if (enumerator.Current.Value.flavor == DEAD)
                {
                    continue;
                }
                result.Add(enumerator.Current.Value);
            }

            return result.ToArray();
        }

        public int GetNeighbourCount(ulong key)
        {
            int result;
            if (this.neighbourCountHash.TryGetValue(key, out result))
            {
                return result;
            }
            return 0;
        }

        public void SetCellFutureFlavor(GridPoint gridPoint, int flavor)
        {
            var key = GetKey(gridPoint.x, gridPoint.y);
            Cell cell;
            if (!this.cells.TryGetValue(key, out cell))
            {
                if (flavor == DEAD)
                {
                    return;
                }
                cell = new Cell
                {
                    gridPoint = gridPoint,
                    key = key,
                    flavor = DEAD,
                    futureFlavor = flavor,
                };
                this.cells.Add(key, cell);
                this.futureFlavorCells.Add(cell);
                return;
            }

            if (cell.flavor == flavor)
            {
                return;
            }
            cell.futureFlavor = flavor;
            this.futureFlavorCells.Add(cell);
        }

        #endregion

        #region Tools
        protected void NextGeneration_Partial(Rule[] rules, List<Cell> cells)
        {
            for (int length = cells.Count, i = 0; i < length; ++i)
            {
                var cell = cells[i];
                var count = this.QueryNeighbourCount(cell.gridPoint);
                this.neighbourCountHash[cell.key] = count;

                this.topLeft.x = Math.Min(this.topLeft.x, cell.gridPoint.x);
                this.topLeft.y = Math.Min(this.topLeft.y, cell.gridPoint.y);
                this.bottomRight.x = Math.Max(this.bottomRight.x, cell.gridPoint.x);
                this.bottomRight.y = Math.Max(this.bottomRight.y, cell.gridPoint.y);
            }

            for (int length = cells.Count, i = 0; i < length; ++i)
            {
                Rule.ApplyRules(this, cells[i], rules);
                ++this.activeCellCount;
            }
        }

        protected void ApplyFutureFlavors()
        {
            this.invalidCells.Clear();
            for (int length = this.futureFlavorCells.Count, i = 0; i < length; ++i)
            {
                var cell = this.futureFlavorCells[i];
                if (cell.futureFlavor == DEAD)
                {
                    --this.generationSize;
                }
                else
                {
                    ++this.generationSize;
                }
                cell.flavor = cell.futureFlavor;
                cell.futureFlavor = DEAD;
                this.InvalidateNeighbourhood(cell.gridPoint);
            }
            this.futureFlavorCells.Clear();
        }

        protected int QueryNeighbourCount(GridPoint gridPoint)
        {
            var result = 0;
            var keys = this.GetNeighbourhoodKeys(gridPoint);
            for(int length = keys.Length, i = 0; i < length; ++i)
            {
                var key = keys[i];
                Cell cell;
                if (!this.cells.TryGetValue(key, out cell))
                {
                    continue;
                }
                if (cell.flavor == DEAD)
                {
                    continue;
                }
                ++result;
            }
            return result;
        }

        protected int QueryMemCellCount()
        {
            return this.cells.Count;
        }

        protected int QueryGenerationSize()
        {
            var result = 0;

            var enumerator = this.cells.GetEnumerator();
            while (enumerator.MoveNext())
            {
                if (enumerator.Current.Value.flavor == DEAD)
                {
                    continue;
                }
                ++result;
            }

            if(result != this.generationSize)
            {
                throw new InvalidOperationException();
            }

            return this.generationSize;
        }

        protected ulong[] GetNeighbourhoodKeys(GridPoint gridPoint)
        {
            int left = gridPoint.x - 1;
            int right = gridPoint.x + 1;
            int bottom = gridPoint.y - 1;
            int top = gridPoint.y + 1;

            if(this.wrap)
            {
                int minX = -this.wrapRadius;
                int maxX = this.wrapRadius;
                int minY = -this.wrapRadius;
                int maxY = this.wrapRadius;

                if (left < minX) left = maxX;
                if (right > maxX) right = minX;
                if (bottom < minY) bottom = maxY;
                if (top > maxY) top = minY;
            }

            ulong[] result = new ulong[]
            {
                GetKey(left,        bottom),
                GetKey(gridPoint.x, bottom),
                GetKey(right,       bottom),

                GetKey(left,        gridPoint.y),
                GetKey(right,       gridPoint.y),

                GetKey(left,        top),
                GetKey(gridPoint.x, top),
                GetKey(right,       top),
            };

            return result;
        }

        protected void InvalidateNeighbourhood(GridPoint gridPoint)
        {
            var keys = this.GetNeighbourhoodKeys(gridPoint);

            for (int length = keys.Length, i = 0; i < length; ++i)
            {
                var key = keys[i];
                Cell cell;
                if (!this.cells.TryGetValue(key, out cell))
                {
                    var xy = SplitKey(key);
                    cell = new Cell
                    {
                        gridPoint = new GridPoint
                        {
                            x = xy[0],
                            y = xy[1],
                        },
                        key = key,
                        flavor = DEAD,
                    };
                    this.cells.Add(key, cell);
                }
                this.invalidCells[key] = cell;
            }
        }

        protected void Recycle()
        {
            List<ulong> doomedKeys = new List<ulong>();
            var enumerator = this.cells.GetEnumerator();
            while (enumerator.MoveNext())
            {
                if (enumerator.Current.Value.flavor == DEAD && this.invalidCells.ContainsKey(enumerator.Current.Key))
                {
                    doomedKeys.Add(enumerator.Current.Key);
                }
            }
            for (int length = doomedKeys.Count, i = 0; i < length; ++i)
            {
                this.cells.Remove(doomedKeys[i]);
            }
        }
        #endregion

        #region Static methods
        protected static ulong GetKey(int x, int y)
        {
            ulong x64 = unchecked((ulong)(uint)x);
            ulong y64 = unchecked((ulong)(uint)y);
            return (x64 << 32) | y64;
        }

        protected static int[] SplitKey(ulong key)
        {
            return new int[]
            {
                unchecked((int)(key >> 32)),
                unchecked((int)(key << 32 >> 32)),
            };
        }
        #endregion

        #region Properties
        public Rule[] Rules
        {
            get
            {
                return this.rules;
            }
            set
            {
                this.rules = value;
            }
        }
        public int MemCellCount
        {
            get
            {
                return this.memCellCount;
            }
        }
        public int ActiveCellCount
        {
            get
            {
                return this.activeCellCount;
            }
        }
        public int OccupiedCellCount
        {
            get
            {
                return this.QueryGenerationSize();
            }
        }
        public int Generation
        {
            get
            {
                return this.generation;
            }
        }
        public GridPoint OccupiedTopLeft
        {
            get
            {
                return this.topLeft;
            }
        }
        public GridPoint OccupiedBottomRight
        {
            get
            {
                return this.bottomRight;
            }
        }
        public int OccupiedWidth
        {
            get
            {
                return this.bottomRight.x - this.topLeft.x;
            }
        }
        public int OccupiedHeight
        {
            get
            {
                return this.bottomRight.y - this.topLeft.y;
            }
        }
        public bool Wrap
        {
            get
            {
                return this.wrap;
            }
            set
            {
                this.wrap = value;
            }
        }
        public int WrapRadius
        {
            get
            {
                return this.wrapRadius;
            }
            set
            {
                this.wrapRadius = value;
            }
        }
        #endregion

        #region Constants
        public const int DEAD = 0;
        public const int ALIVE = 1;
        #endregion

        #region Fields
        Configuration configuration;

        bool wrap = false;
        int wrapRadius = 0;
        Rule[] rules = null;

        Dictionary<ulong, Cell> cells = new Dictionary<ulong, Cell>();
        List<Cell> futureFlavorCells = new List<Cell>();
        Dictionary<ulong, Cell> invalidCells = new Dictionary<ulong, Cell>();
        Dictionary<ulong, int> neighbourCountHash = new Dictionary<ulong, int>();

        int generation = 0;
        int generationSize = 0;
        int memCellCount = 0;
        int previousMmemCellCount = 0;
        int activeCellCount = 0;
        GridPoint topLeft = new GridPoint();
        GridPoint bottomRight = new GridPoint();

        int recycleFrequencyUpperBound = 5000;

        long totalGenerationTime = 0;
        #endregion
    }
}
