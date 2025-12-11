// R1Q2/daniel
//  - lacks documentation
//  - the assembly lacks features
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Falael.Data.Spatial.Operators
{
	public class RangeFilter : IOperator
	{
		public RangeFilter(string resultAxisName, string axisName, decimal minValue, decimal maxValue)
		{
            this.resultAxisName = resultAxisName;
            this.axisName = axisName;
			this.minValue = minValue;
            this.maxValue = maxValue;
        }

        class MappingData
        {
            public MappingData(int resultDi)
            {
                this.resultDi = resultDi;
            }
            public int ResultDi
            {
                get
                {
                    return this.resultDi;
                }
            }
            int resultDi;
        }

        public bool Apply(OperatorContext operatorContext, OperatorResult operatorResult)
		{
            var operandDi = operatorContext.OperandSchemaMap[this.axisName];
            var dimension = operatorContext.OperandDimensions[operandDi];

			var n1 = this.minValue;
			var n2 = this.maxValue;
			if (n2 < n1)
			{
				var temp = n2;
				n2 = n1;
				n1 = temp;
			}

			if (n1 < dimension.N1)
			{
				n1 = dimension.N1;
			}
			if (n2 > dimension.N2)
			{
				n2 = dimension.N2;
			}

			var subDimension = new FragmentedSubDimension(dimension, n1, n2);

			var resultDi = operatorContext.ResultSchemaMap[this.resultAxisName];
			operatorResult.ResultDimensions[resultDi] = subDimension;
			operatorResult.ReverseDimensionMapping[operandDi] = new ReverseMapping(new MappingData(resultDi), (resultVvector, data) =>
            {
                return resultVvector[((MappingData)data).ResultDi];
            });
            return true;
		}

		public string AxisName
		{
			get
			{
				return this.axisName;
			}
		}
        public string ResultAxisName
        {
            get
            {
                return this.resultAxisName;
            }
        }
        public decimal MinValue
        {
			get
			{
				return this.minValue;
			}
		}
        public decimal MaxValue
        {
            get
            {
                return this.maxValue;
            }
        }

        string axisName;
        string resultAxisName;
        decimal minValue;
        decimal maxValue;
	}
}
