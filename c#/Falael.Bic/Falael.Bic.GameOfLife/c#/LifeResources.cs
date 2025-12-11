// R1Q3/daniel
//  - documentation
//  - architecture
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Falael.Bic.GameOfLife
{
    public static class LifeResources
    {
        public static LifeDocument.Rule[] conway3Rules;
        public static LifeDocument.Rule[] conway2Rules;

        public static LifeDocument.Configuration rPentomino;

        static LifeResources()
        {
            #region conway3
            #region Rule set
            conway3Rules = new LifeDocument.Rule[]
            {
                new LifeDocument.Rule(
                    "death by isolation",
                    (document, cell) =>
                    {
                        var neighbourCount = document.GetNeighbourCount(cell.key);
                        return neighbourCount < 2;
                    },
                    (document, cell) =>
                    {
                        document.SetCellFutureFlavor(cell.gridPoint, LifeDocument.DEAD);
                    }
                ),
                new LifeDocument.Rule(
                    "death by overcrowding",
                    (document, cell) =>
                    {
                        var neighbourCount = document.GetNeighbourCount(cell.key);
                        return neighbourCount > 3;
                    },
                    (document, cell) =>
                    {
                        document.SetCellFutureFlavor(cell.gridPoint, LifeDocument.DEAD);
                    }
                ),
                new LifeDocument.Rule(
                    "birth",
                    (document, cell) =>
                    {
                        var neighbourCount = document.GetNeighbourCount(cell.key);
                        return neighbourCount == 3;
                    },
                    (document, cell) =>
                    {
                        document.SetCellFutureFlavor(cell.gridPoint, LifeDocument.ALIVE);
                    }
                )
            };
            #endregion
            rPentomino = new LifeDocument.Configuration
            {
                occupiedGridPoints = new LifeDocument.GridPoint[]
                {
                    new LifeDocument.GridPoint { x = 0, y = 0},
                    new LifeDocument.GridPoint { x = 0, y = 1},
                    new LifeDocument.GridPoint { x = 0, y = 2},
                    new LifeDocument.GridPoint { x = 1, y = 0},
                    new LifeDocument.GridPoint { x = -1, y = 1}
                },
            };
            #endregion

            #region conway2
            conway2Rules = new LifeDocument.Rule[]
            {
                new LifeDocument.Rule(
                    "death by isolation",
                    (document, cell) =>
                    {
                        var neighbourCount = document.GetNeighbourCount(cell.key);
                        return neighbourCount < 2;
                    },
                    (document, cell) =>
                    {
                        document.SetCellFutureFlavor(cell.gridPoint, LifeDocument.DEAD);
                    }
                ),
                new LifeDocument.Rule(
                    "death by overcrowding",
                    (document, cell) =>
                    {
                        var neighbourCount = document.GetNeighbourCount(cell.key);
                        return neighbourCount > 3;
                    },
                    (document, cell) =>
                    {
                        document.SetCellFutureFlavor(cell.gridPoint, LifeDocument.DEAD);
                    }
                ),
                new LifeDocument.Rule(
                    "birth",
                    (document, cell) =>
                    {
                        var neighbourCount = document.GetNeighbourCount(cell.key);
                        return neighbourCount == 2;
                    },
                    (document, cell) =>
                    {
                        document.SetCellFutureFlavor(cell.gridPoint, LifeDocument.ALIVE);
                    }
                )
            };
            #endregion
        }

        public static LifeDocument.Rule[] BuildConwayFuzzyRules(float isolationTreshold, float overcrowdingTreshold, float birthCondition)
        {
            return new LifeDocument.Rule[]
            {
                new LifeDocument.Rule(
                    "death by isolation",
                    (document, cell) =>
                    {
                        var neighbourCount = document.GetNeighbourCount(cell.key);
                        return neighbourCount < _math_biasedFuzzyRound(isolationTreshold);
                    },
                    (document, cell) =>
                    {
                        document.SetCellFutureFlavor(cell.gridPoint, LifeDocument.DEAD);
                    }
                ),
                new LifeDocument.Rule(
                    "death by overcrowding",
                    (document, cell) =>
                    {
                        var neighbourCount = document.GetNeighbourCount(cell.key);
                        return neighbourCount > _math_biasedFuzzyRound(overcrowdingTreshold);
                    },
                    (document, cell) =>
                    {
                        document.SetCellFutureFlavor(cell.gridPoint, LifeDocument.DEAD);
                    }
                ),
                new LifeDocument.Rule(
                    "birth",
                    (document, cell) =>
                    {
                        var neighbourCount = document.GetNeighbourCount(cell.key);
                        return neighbourCount == _math_biasedFuzzyRound(birthCondition);
                    },
                    (document, cell) =>
                    {
                        document.SetCellFutureFlavor(cell.gridPoint, LifeDocument.ALIVE);
                    }
                )
            };
        }

        public static LifeDocument.Configuration GenerateRandomConfiguration(int wrapRadius, int[] flavors)
        {
            List<LifeDocument.GridPoint> occupiedGridPoints = new List<LifeDocument.GridPoint>();

            for (int x = -wrapRadius, endx = wrapRadius; x <= endx; ++x)
            {
                for (int y = -wrapRadius, endy = wrapRadius; y <= endy; ++y)
                {
                    var flavorIndex = (int)Math.Round(RandomDouble() * (flavors.Length - 1));
                    var flavor = flavors[flavorIndex];
                    if (flavor == LifeDocument.DEAD)
                    {
                        continue;
                    }
                    occupiedGridPoints.Add(new LifeDocument.GridPoint { x = x, y = y });
                }
            }

            return new LifeDocument.Configuration
            {
                occupiedGridPoints = occupiedGridPoints.ToArray(),
                wrap = true,
                wrapRadius = wrapRadius,
            };
        }
        public static float _math_biasedFuzzyRound(float f)
        {
            var n = (float)Math.Floor(f);
            var pN = f - n;
            var selectN = RandomDouble() < pN;
            return selectN ? (float)Math.Ceiling(f) : n;
        }

        [ThreadStatic]
        static Random random = new Random(~unchecked((int)DateTime.Now.Ticks));
        static double RandomDouble()
        {
            if(random == null)
            {
                random = new Random(~unchecked((int)DateTime.Now.Ticks));
            }
            return random.NextDouble();
        }
    }
}
