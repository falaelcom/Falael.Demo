"use strict";

include("StdAfx.js");

class ForexFeatureV4_Extremums
{
	constructor(par)
	{
		this._extremumSample = par.extremumSample;	//	MappedArray
		this._extremumTypes = par.extremumTypes;		//	EExtremumTypesV4
	}

	get extremumSample()
	{
		return this._extremumSample;
	}

	get extremumTypes()
	{
		return this._extremumTypes;
	}
}
