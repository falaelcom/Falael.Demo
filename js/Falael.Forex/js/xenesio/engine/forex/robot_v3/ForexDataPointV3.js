"use strict";

include("StdAfx.js");

class ForexDataPointV3
{
	//	featureStatus: EForexFeatureStatusV3
	constructor(value, featureStatus)
	{
		this._dt = value.dt;
		this._ac = value.ac;
		this._ah = value.ah;
		this._al = value.al;
		this._ao = value.ao;
		this._bc = value.bc;
		this._bh = value.bh;
		this._bl = value.bl;
		this._bo = value.bo;

		this._featureStatus = featureStatus;
	}


	get dt()
	{
		return this._dt;
	}

	get ac()
	{
		return this._ac;
	}

	set ac(value)
	{
		switch (this._featureStatus)
		{
			case EForexFeatureStatusV3.Volatile: this._ac = value; break;
			case EForexFeatureStatusV3.Sealed: throw "Invalid operation.";
			default: throw "Not implemented.";
		}
	}

	get ah()
	{
		return this._ah;
	}

	set ah(value)
	{
		switch (this._featureStatus)
		{
			case EForexFeatureStatusV3.Volatile: this._ah = value; break;
			case EForexFeatureStatusV3.Sealed: throw "Invalid operation.";
			default: throw "Not implemented.";
		}
	}

	get al()
	{
		return this._al;
	}

	set al(value)
	{
		switch (this._featureStatus)
		{
			case EForexFeatureStatusV3.Volatile: this._al = value; break;
			case EForexFeatureStatusV3.Sealed: throw "Invalid operation.";
			default: throw "Not implemented.";
		}
	}

	get ao()
	{
		return this._ao;
	}
	
	set ao(value)
	{
		switch (this._featureStatus)
		{
			case EForexFeatureStatusV3.Volatile: this._ao = value; break;
			case EForexFeatureStatusV3.Sealed: throw "Invalid operation.";
			default: throw "Not implemented.";
		}
	}

	get bc()
	{
		return this._bc;
	}

	set bc(value)
	{
		switch (this._featureStatus)
		{
			case EForexFeatureStatusV3.Volatile: this._bc = value; break;
			case EForexFeatureStatusV3.Sealed: throw "Invalid operation.";
			default: throw "Not implemented.";
		}
	}

	get bh()
	{
		return this._bh;
	}

	set bh(value)
	{
		switch (this._featureStatus)
		{
			case EForexFeatureStatusV3.Volatile: this._bh = value; break;
			case EForexFeatureStatusV3.Sealed: throw "Invalid operation.";
			default: throw "Not implemented.";
		}
	}

	get bl()
	{
		return this._bl;
	}

	set bl(value)
	{
		switch (this._featureStatus)
		{
			case EForexFeatureStatusV3.Volatile: this._bl = value; break;
			case EForexFeatureStatusV3.Sealed: throw "Invalid operation.";
			default: throw "Not implemented.";
		}
	}

	get bo()
	{
		return this._bo;
	}

	set bo(value)
	{
		switch (this._featureStatus)
		{
			case EForexFeatureStatusV3.Volatile: this._bo = value; break;
			case EForexFeatureStatusV3.Sealed: throw "Invalid operation.";
			default: throw "Not implemented.";
		}
	}

	get featureStatus()
	{
		return this._featureStatus;
	}

	set featureStatus(value)
	{
		this._featureStatus = value;
	}
}
