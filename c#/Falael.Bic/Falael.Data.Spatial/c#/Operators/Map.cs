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
	public class Map : IOperator
	{
		public Map(string resultAxisName, string axisName)
		{
			this.resultAxisName = resultAxisName;
			this.axisName = axisName;
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
			var resultDi = operatorContext.ResultSchemaMap[this.resultAxisName];
			operatorResult.ResultDimensions[resultDi] = operatorContext.OperandDimensions[operandDi];
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

		string axisName;
		string resultAxisName;
	}
}
