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
	public class Slice : IOperator
	{
		public Slice(string axisName, decimal value, EDimensionHitTestHint dimensionHitTestHint)
		{
			this.axisName = axisName;
			this.value = value;
			this.dimensionHitTestHint = dimensionHitTestHint;
		}

		class MappingData
		{
			public MappingData(decimal fixedValue)
			{
				this.fixedValue = fixedValue;
			}
			public decimal FixedValue
			{
				get
				{
					return this.fixedValue;
				}
			}
			decimal fixedValue;
		}

		public bool Apply(OperatorContext operatorContext, OperatorResult operatorResult)
		{
            var operandDi = operatorContext.OperandSchemaMap[this.axisName];
            var dimension = operatorContext.OperandDimensions[operandDi];
			var hitTestResult = dimension.HitTest(this.value, this.dimensionHitTestHint);
            if(!hitTestResult.Success)
            {
                return false;
            }
			operatorResult.ReverseDimensionMapping[operandDi] = new ReverseMapping(new MappingData(hitTestResult.V), (resultVvector, data) =>
			{
				return ((MappingData)data).FixedValue;
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
		public decimal Value
		{
			get
			{
				return this.value;
			}
		}
		public EDimensionHitTestHint DimensionHitTestHint
		{
			get
			{
				return this.dimensionHitTestHint;
			}
		}

		string axisName;
		decimal value;
		EDimensionHitTestHint dimensionHitTestHint;
	}
}
