"use strict";

include("StdAfx.js");

//	TODO: unit tests
class Dictionary
{
	constructor()
	{
		this._branches = {};
		this._length = 0;
	}


	get(key)
	{
		if (!key.getHashCode || !key.equals) throw "Invalid key.";
		var hashCode = key.getHashCode();
		var branch = this._branches[hashCode];
		if (!branch) return void (0);
		if (!Array.isArray(branch)) return branch.value;
		for (var length = branch.length, i = 0; i < length; ++i) if (branch[i].key.equals(key)) return branch[i].value;
		return void (0);
	}

	add(key, value)
	{
		if (!key.getHashCode || !key.equals) throw "Invalid key.";
		var hashCode = key.getHashCode();
		var branch = this._branches[hashCode];
		if (!branch)
		{
			this._branches[hashCode] = { key: key, value: value };
			++this._length;
			return value;
		}
		if (!Array.isArray(branch))
		{
			if (branch.key.equals(key)) throw "Duplicate key.";
			this._branches[hashCode] = [branch, { key: key, value: value }];
			++this._length;
			return value;
		}
		for (var length = branch.length, i = 0; i < length; ++i) if (branch[i].key.equals(key)) throw "Duplicate key.";
		branch.push({ key: key, value: value });
		++this._length;
		return value;
	}

	remove(key)
	{
		if (!key.getHashCode || !key.equals) throw "Invalid key.";
		var hashCode = key.getHashCode();
		var branch = this._branches[hashCode];
		if (!branch) return void(0);
		if (!Array.isArray(branch)) 
		{
			delete this._branches[hashCode];
			--this._length;
			return branch.value;
		}
		for (var length = branch.length, i = 0; i < length; ++i)
		{
			var kvp = branch[i];
			if (!kvp.key.equals(key)) continue;
			branch.splice(i, 1);
			if (branch.length == 1) this._branches[hashCode] = branch[0];
			--this._length;
			return kvp.value;
		}
		return void(0);
	}

	clear()
	{
		this._branches = {};
		this._length = 0;
	}

	toArray()
	{
		var result = [];
		for (var hashCode in this._branches)
		{
			var branch = this._branches[hashCode];
			if (!Array.isArray(branch)) { result.push(branch.value); continue; }
			for (var length = branch.length, i = 0; i < length; ++i) result.push(branch[i].value);
		}
		return result;
	}

	toKvpArray()
	{
		var result = [];
		for (var hashCode in this._branches)
		{
			var branch = this._branches[hashCode];
			if (!Array.isArray(branch)) { result.push(branch); continue; }
			for (var length = branch.length, i = 0; i < length; ++i) result.push(branch[i]);
		}
		return result;
	}

	get length()
	{
		return this._length;
	}
}
