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
	public interface IOperator
	{
		bool Apply(OperatorContext operatorContext, OperatorResult operatorResult);
	}
}
