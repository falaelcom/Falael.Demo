// R1Q2/daniel
//  - lacks documentation
//  - the assembly lacks features
using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Falael.Data.Spatial
{
    public class SubSpace : Space
	{
        #region Constructors
        public SubSpace(ISpace superSpace, IOperator[] operators, string[] superSpaceSchema, string[] subSpaceSchema)
        {
			this.superSpace = superSpace;
			this.operators = operators;
			this.superSpaceSchema = superSpaceSchema;
			this.subSpaceSchema = subSpaceSchema;

			OperatorContext operatorContext = new OperatorContext(this.superSpace.Dimensions, superSpaceSchema, subSpaceSchema);
			OperatorResult operatorResult = new OperatorResult(superSpaceSchema.Length, subSpaceSchema.Length);

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
				this.dimensions = operatorResult.ResultDimensions;
				this.reverseDimensionMapping = operatorResult.ReverseDimensionMapping;
			}
			else
			{
				this.dimensions = Enumerable.Repeat<IDimension>(null, subSpaceSchema.Length).ToArray();
				this.reverseDimensionMapping = Enumerable.Repeat<ReverseMapping>(null, superSpaceSchema.Length).ToArray();
			}

			this.spaceIterationPlan = new SpaceIterationPlan(this.dimensions);
		}
		#endregion

		#region Operations
		public decimal[] ReverseVvector(decimal[] subSpaceVvector)
		{
			decimal[] superSpaceVvector = Enumerable.Repeat<decimal>(-1, this.superSpace.Dimensions.Length).ToArray();
			for (int length = this.reverseDimensionMapping.Length, i = 0; i < length; ++i)
			{
				var mapping = this.reverseDimensionMapping[i];
				superSpaceVvector[i] = mapping.Map(subSpaceVvector, mapping.Data);
			}
			return superSpaceVvector;
		}
		public SpaceIterator ReverseSpaceIterator(SpaceIterator subSpaceIterator)
		{
			var subSpaceVvector = this.GetAt(subSpaceIterator);
			var superSpaceVvector = this.ReverseVvector(subSpaceVvector);
			var hitTestResult = this.superSpace.HitTest(superSpaceVvector, EDimensionHitTestHint.Precise);
			if(!hitTestResult.Success)
			{
				throw new InvalidOperationException();
			}

			return hitTestResult.SpaceIterator;
		}
		#endregion

		#region Properties
		public IOperator[] Operators
		{
			get
			{
				return this.operators;
			}
		}
		public string[] SuperSpaceSchema
		{
			get
			{
				return this.superSpaceSchema;
			}
		}
		public string[] SubSpaceSchema
		{
			get
			{
				return this.subSpaceSchema;
			}
		}
		public ReverseMapping[] ReverseDimensionMapping
		{
			get
			{
				return this.reverseDimensionMapping;
			}
		}
		#endregion

		#region Static members
		#endregion

		#region Fields
		ISpace superSpace;

		IOperator[] operators;
		string[] superSpaceSchema;
		string[] subSpaceSchema;

		ReverseMapping[] reverseDimensionMapping;
		#endregion
	}
}
