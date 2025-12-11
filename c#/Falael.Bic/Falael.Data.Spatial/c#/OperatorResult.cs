// R1Q2/daniel
//  - lacks documentation
//  - the assembly lacks features
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Falael.Data.Spatial
{
	public class OperatorResult
	{
		public OperatorResult(int operandDimensionCount, int resultDimensionCount)
		{
			this.resultDimensions = Enumerable.Repeat<IDimension>(null, resultDimensionCount).ToArray();
			this.reverseDimensionMapping = Enumerable.Repeat<ReverseMapping>(null, operandDimensionCount).ToArray();
		}

		public IDimension[] ResultDimensions
		{
			get
			{
				return this.resultDimensions;
			}
		}
		public ReverseMapping[] ReverseDimensionMapping
		{
			get
			{
				return this.reverseDimensionMapping;
			}
		}

        IDimension[] resultDimensions;
		ReverseMapping[] reverseDimensionMapping;
	}
}
