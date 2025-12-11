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
	public class ReverseMapping
	{
		public ReverseMapping(object data, Func<decimal[], object, decimal> map)
		{
			this.data = data;
			this.map = map;
		}

		public object Data
		{
			get
			{
				return this.data;
			}
		}
		public Func<decimal[], object, decimal> Map
		{
			get
			{
				return this.map;
			}
		}

		object data;
		Func<decimal[], object, decimal> map;
	}
}
