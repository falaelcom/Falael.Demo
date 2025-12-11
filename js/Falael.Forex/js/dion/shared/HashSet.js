"use strict";

module.exports =

//	TODO: unit tests
class HashSet
{
	constructor()
	{
		this._branches = {};
		this._length = 0;
	}

	static staticConstructor()	//	called explicitly after the class declaration
	{
		Boolean.prototype.getHashCode = function getHashCode() { return this; }
		Boolean.prototype.equals = function equals(r) { return this === r; }

		Number.prototype.getHashCode = function getHashCode() { return this; }
		Number.prototype.equals = function equals(r) { return this === r; }

		////	https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0
		//String.prototype.getHashCode = function getHashCode()
		//{
		//	var result = 0;
		//	for (var i = this.length - 1; i >= 0; --i) result = ((result << 5) - result) + this.charCodeAt(i) | 0;
		//	return result;
		//}
		String.prototype.getHashCode = function getHashCode() { return this; }
		String.prototype.equals = function equals(r) { return this === r; }
	}


	has(key)
	{
		if (!key.getHashCode || !key.equals) throw "Invalid key.";
		var hashCode = key.getHashCode();
		var branch = this._branches[hashCode];
		if (branch === void(0)) return false;
		if (!Array.isArray(branch)) return true;
		for (var length = branch.length, i = 0; i < length; ++i) if (branch[i].equals(key)) return true;
		return false;
	}

	set(key)
	{
		if (!key.getHashCode || !key.equals) throw "Invalid key.";
		var hashCode = key.getHashCode();
		var branch = this._branches[hashCode];
		if (branch === void (0))
		{
			this._branches[hashCode] = key;
			++this._length;
			return false;
		}
		if (!Array.isArray(branch))
		{
			if (branch.equals(key)) return true;
			this._branches[hashCode] = [branch, key];
			++this._length;
			return false;
		}
		for (var length = branch.length, i = 0; i < length; ++i) if (branch[i].equals(key)) return true;
		branch.push(key);
		++this._length;
		return false;
	}

	remove(key)
	{
		if (!key.getHashCode || !key.equals) throw "Invalid key.";
		var hashCode = key.getHashCode();
		var branch = this._branches[hashCode];
		if (branch === void (0)) return false;
		if (!Array.isArray(branch))
		{
			if (!key.equals(branch)) return false;
			delete this._branches[hashCode];
			--this._length;
			return true;
		}
		for (var length = branch.length, i = 0; i < length; ++i)
		{
			var key2 = branch[i];
			if (!key2.equals(key)) continue;
			branch.splice(i, 1);
			if (branch.length == 1) this._branches[hashCode] = branch[0];
			--this._length;
			return true;
		}
		return false;
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
			if (!Array.isArray(branch)) { result.push(branch); continue; }
			for (var length = branch.length, i = 0; i < length; ++i) result.push(branch[i]);
		}
		return result;
	}

	getIterator()
	{
		return function* ()
		{
			for (var hashCode in this._branches)
			{
				var branch = this._branches[hashCode];
				if (!Array.isArray(branch)) { yield branch; continue; }
				for (var length = branch.length, i = 0; i < length; ++i) yield branch[i];
			}
		}.bind(this)();
	}


	get length()
	{
		return this._length;
	}
}

module.exports.staticConstructor();