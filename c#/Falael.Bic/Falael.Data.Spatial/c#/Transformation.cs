// R1Q2/daniel
//  - lacks documentation
//  - the assembly lacks features
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Falael.Data.Spatial.Operators;

namespace Falael.Data.Spatial
{
	public class Transformation
	{
		public Transformation(IOperator[] operators, IDimension[] operandDimensions, string[] operandSchema, string[] resultSchema)
		{
			this.operators = operators;
			this.operandDimensions = operandDimensions;
			this.operandSchema = operandSchema;
			this.resultSchema = resultSchema;

			OperatorContext operatorContext = new OperatorContext(operandDimensions, operandSchema, resultSchema);
			OperatorResult operatorResult = new OperatorResult(operandSchema.Length, resultSchema.Length);

			bool isEmpty = false;
			for (int length = this.operators.Length, i = 0; i < length; ++i)
			{
				if (!this.operators[i].Apply(operatorContext, operatorResult))
				{
					isEmpty = true;
					break;
				}
			}
			if (!isEmpty)
			{
				this.resultDimensions = operatorResult.ResultDimensions;
				this.reverseDimensionMapping = operatorResult.ReverseDimensionMapping;
			}
			else
			{
				this.resultDimensions = Enumerable.Repeat<IDimension>(null, resultSchema.Length).ToArray();
				this.reverseDimensionMapping = Enumerable.Repeat<ReverseMapping>(null, operandSchema.Length).ToArray();
			}
		}

		public decimal[] ReverseVvector(decimal[] resultVvector)
		{
			decimal[] operandVvector = Enumerable.Repeat<decimal>(-1, this.operandDimensions.Length).ToArray();
			for (int length = this.reverseDimensionMapping.Length, i = 0; i < length; ++i)
			{
				var mapping = this.reverseDimensionMapping[i];
				operandVvector[i] = mapping.Map(resultVvector, mapping.Data);
			}
			return operandVvector;
		}

		public IOperator[] Operators
		{
			get
			{
				return this.operators;
			}
		}
		public IDimension[] OperandDimensions
		{
			get
			{
				return this.operandDimensions;
			}
		}
		public string[] OperandSchema
		{
			get
			{
				return this.operandSchema;
			}
		}
		public string[] ResultSchema
		{
			get
			{
				return this.resultSchema;
			}
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

		IOperator[] operators;
        IDimension[] operandDimensions;
		string[] operandSchema;
		string[] resultSchema;

        IDimension[] resultDimensions;
		ReverseMapping[] reverseDimensionMapping;
	}
}
