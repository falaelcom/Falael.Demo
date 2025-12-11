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
	public class OperatorContext
	{
		public OperatorContext(IDimension[] operandDimensions, string[] operandSchema, string[] resultSchema)
		{
			this.operandDimensions = operandDimensions;

			for (int length = operandSchema.Length, i = 0; i < length; ++i)
			{
				this.operandSchemaMap[operandSchema[i]] = i;
			}
			for (int length = resultSchema.Length, i = 0; i < length; ++i)
			{
				this.resultSchemaMap[resultSchema[i]] = i;
			}
		}

		public IDimension[] OperandDimensions
		{
			get
			{
				return this.operandDimensions;
			}
		}
		public Dictionary<string, int> OperandSchemaMap
		{
			get
			{
				return this.operandSchemaMap;
			}
		}
		public Dictionary<string, int> ResultSchemaMap
		{
			get
			{
				return this.resultSchemaMap;
			}
		}

        IDimension[] operandDimensions;
		Dictionary<string, int> operandSchemaMap = new Dictionary<string, int>();
		Dictionary<string, int> resultSchemaMap = new Dictionary<string, int>();
	}
}
