// R1Q3/daniel
//  - documentation
//  - architecture
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Runtime.InteropServices;

namespace Falael.Bic.GameOfLife
{
    //  http://people.duke.edu/~rnau/411trend.htm
    public class ConwaySet
    {
        #region Constructors
        public ConwaySet(LifeDocument document, ExplorationOptions options)
        {
            this.document = document;
            this.options = options;
        }
        #endregion

        #region Nested types
        public class ExplorationOptions
        {
            public int iterationCount = 2000;
            public int activeTreshold = 10;
        }

        public class DataItem
        {
            public int activeCellCount;
            public int generationSize;
            public int worldWidth;
            public int worldHeight;
            public float fulnessPercent;               //  only meaningful with wrapped worlds
        }


		[StructLayout(LayoutKind.Explicit, Pack = 1)]
		public struct ExplorationStatsAverageInfo_Old
		{
			[FieldOffset(0)] public float finite;                       //	size 4
			[FieldOffset(4)] public float activeCellCountTrend;         //	size 4
			[FieldOffset(8)] public float generationSizeTrend;          //	size 4
			[FieldOffset(12)] public float fulnessTrend;                 //	size 4
			[FieldOffset(16)] public float averageFullnessPercent;       //	size 4
			[FieldOffset(20)] public float averageActivity;				//	size 4
			[FieldOffset(24)] public float averageGenerationSize;        //	size 4

			public static ExplorationStatsAverageInfo_Old FromObject(ExplorationStatsAverage obj)
			{
				return new ExplorationStatsAverageInfo_Old
				{
					finite = obj.finite,
					activeCellCountTrend = obj.activeCellCountTrend,
					generationSizeTrend = obj.generationSizeTrend,
					fulnessTrend = obj.fulnessTrend,
					averageFullnessPercent = obj.averageFullnessPercent,
					averageActivity = obj.averageActivity,
					averageGenerationSize = obj.averageGenerationSize,
				};
			}
		}

		[StructLayout(LayoutKind.Explicit, Pack = 1)]
		public struct ExplorationStatsAverageInfo
		{
			[FieldOffset(0)] public float finite;                       //	size 4
			[FieldOffset(4)] public float activeCellCountTrend;         //	size 4
			[FieldOffset(8)] public float generationSizeTrend;          //	size 4
			[FieldOffset(12)] public float fulnessTrend;                 //	size 4
			[FieldOffset(16)] public float averageFullnessPercent;       //	size 4
			[FieldOffset(20)] public float averageActivity;				//	size 4
			[FieldOffset(24)] public float averageGenerationSize;        //	size 4
			[FieldOffset(28)] public decimal x;                         //	size 16
			[FieldOffset(44)] public decimal y;                           //	size 16
			[FieldOffset(60)] public decimal z;                           //	size 16

			public static ExplorationStatsAverageInfo FromObject(ExplorationStatsAverage obj, decimal[] vvector)
			{
				return new ExplorationStatsAverageInfo
				{
					finite = obj.finite,
					activeCellCountTrend = obj.activeCellCountTrend,
					generationSizeTrend = obj.generationSizeTrend,
					fulnessTrend = obj.fulnessTrend,
					averageFullnessPercent = obj.averageFullnessPercent,
					averageActivity = obj.averageActivity,
					averageGenerationSize = obj.averageGenerationSize,
					x = vvector[0],
					y = vvector[1],
					z = vvector[2],
				};
			}
		}

		public class ExplorationStatsAverage
        {
			public float finite = 0;
            public float activeCellCountTrend = 0;
            public float generationSizeTrend = 0;
            public float fulnessTrend = 0;
            public float averageFullnessPercent = 0;

            public float averageActivity = 0;
            public float averageGenerationSize = 0;

            public int count = 0;

            public void Add(ExplorationStats newValue)
            {
                this.count++;

                this.finite = GetAvg(this.finite, newValue.finite ? 1 : 0, this.count);
                this.activeCellCountTrend = GetAvg(this.activeCellCountTrend, newValue.activeCellCountTrend, this.count);
                this.generationSizeTrend = GetAvg(this.generationSizeTrend, newValue.generationSizeTrend, this.count);
                this.fulnessTrend = GetAvg(this.fulnessTrend, newValue.fulnessTrend, this.count);
                this.averageFullnessPercent = GetAvg(this.averageFullnessPercent, newValue.averageFullnessPercent, this.count);
                this.averageActivity = GetAvg(this.averageActivity, newValue.averageActivity, this.count);
                this.averageGenerationSize = GetAvg(this.averageGenerationSize, newValue.averageGenerationSize, this.count);
            }

            //  https://ubuntuincident.wordpress.com/2012/04/25/calculating-the-average-incrementally/
            static float GetAvg(float currentValue, float newValue, int count)
            {
                return currentValue + (newValue - currentValue) / count;
            }

            public override string ToString()
            {
                StringBuilder sb = new StringBuilder();
                sb.AppendFormat("Count = {0}", this.count);
                sb.AppendLine();

                sb.AppendFormat("Finite = {0}", this.finite);
                sb.AppendLine();

                sb.AppendFormat("Active cell count trend = {0}", this.activeCellCountTrend);
                sb.AppendLine();

                sb.AppendFormat("Generation size trend = {0}", this.generationSizeTrend);
                sb.AppendLine();

                sb.AppendFormat("Fulness trend = {0}", this.fulnessTrend);
                sb.AppendLine();

                sb.AppendFormat("Average fullness percent = {0}", this.averageFullnessPercent);
                sb.AppendLine();

                sb.AppendFormat("Average activity = {0}", this.averageActivity);
                sb.AppendLine();

                sb.AppendFormat("Average generation size = {0}", this.averageGenerationSize);
                sb.AppendLine();

                return sb.ToString();
            }
        }

        public class ExplorationStats
        {
            public bool finite = false;
            public int activeCellCountTrend = 0;
            public int generationSizeTrend = 0;
            public int fulnessTrend = 0;                   //  only meaningful with wrapped worlds
            public float averageFullnessPercent = 0;        //  only meaningful with wrapped worlds

            public int averageActivity = 0;
            public int averageGenerationSize = 0;
        }
        #endregion

        #region Operations
        public List<DataItem> Explore()
        {
            this.document.Reset();

            List<DataItem> data = new List<DataItem>();
            int length = this.options.iterationCount;
            var i = 0;
            for (; i < length; ++i)
            {
                this.document.NextGeneration();

                if (this.document.ActiveCellCount < this.options.activeTreshold)
                {
                    break;
                }

                var occupiedCellCount = this.document.OccupiedCellCount;

                data.Add(new DataItem
                {
                    activeCellCount = this.document.ActiveCellCount,
                    generationSize = occupiedCellCount,
                    worldWidth = this.document.OccupiedWidth,
                    worldHeight = this.document.OccupiedHeight,
                    fulnessPercent = 100 * occupiedCellCount / (this.document.OccupiedWidth * this.document.OccupiedHeight),
                });
            }

            return data;
        }

        public ExplorationStats Analyse(List<DataItem> data)
        {
            int lastActiveCellCount = 0;
            int activeCellCountTrendValue = 0;
            int totalActivity = 0;
            int totalGenerationSize = 0;


            int lastGenerationSize = 0;
            int generationSizeTrendValue = 0;

            float lastFullnessPercent = 0;
            int fullnessPercentTrendValue = 0;

            float totalFulness = 0;

            int length = data.Count;
            var i = 0;
            for (; i < length; ++i)
            {
                var item = data[i];

                totalActivity += item.activeCellCount;
                var activeCellCountDelta = item.activeCellCount - lastActiveCellCount;
                activeCellCountTrendValue += Math.Sign(activeCellCountDelta);

                totalGenerationSize += item.generationSize;
                var generationSizeDelta = item.generationSize - lastGenerationSize;
                generationSizeTrendValue += Math.Sign(generationSizeDelta);

                var fullnessPercentDelta = item.fulnessPercent - lastFullnessPercent;
                fullnessPercentTrendValue += Math.Sign(fullnessPercentDelta);

                totalFulness += item.fulnessPercent;

                lastActiveCellCount = item.activeCellCount;
                lastGenerationSize = item.generationSize;
                lastFullnessPercent = item.fulnessPercent;
            }

            return new ExplorationStats
            {
                finite = (i != this.options.iterationCount),
                activeCellCountTrend = activeCellCountTrendValue,
                generationSizeTrend = generationSizeTrendValue,
                fulnessTrend = fullnessPercentTrendValue,
                averageFullnessPercent = totalFulness / i,

                averageActivity = totalActivity / i,
                averageGenerationSize = totalGenerationSize / i,
            };
        }
        #endregion

        LifeDocument document;
        ExplorationOptions options;
    }
}
