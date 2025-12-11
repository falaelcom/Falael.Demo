function SpatialStorage(fileSystem, spatialIndex)
{
	this.fileSystem = fileSystem;
	this.spatialIndex = spatialIndex;
	
	this.dataFileName = "data.array";
	this.l2IndexFileName = "data.l2index";

	this.getFileSystem = function()
	{
		return this.fileSystem;
	}

	this.getSpaceIndexStorage = function()
	{
		return this.spatialIndex;
	}

	this.setAt = function(vvector, value, useNearest)
	{
		var hitTestResult = this.spatialIndex.hitTest(vvector, useNearest);
		if(!hitTestResult)
		{
			throw "Invalid argument: vvector";
		}

		var dataOffset = this.fileSystem.append(this.dataFileName, value);
		var l2IndexOffset = this.fileSystem.append(this.l2IndexFileName, dataOffset);

		this.fileSystem.writeAt(hitTestResult.path, hitTestResult.offset, l2IndexOffset);
	}

	this.getAt = function(vvector, useNearest)
	{
		var hitTestResult = this.spatialIndex.hitTest(vvector, useNearest);
		if(!hitTestResult)
		{
			throw "Invalid argument: vvector";
		}

		var l2IndexOffset = this.fileSystem.readAt(hitTestResult.path, hitTestResult.offset);
		if(l2IndexOffset == null)
		{
			return null;
		}
		var dataOffset = this.fileSystem.readAt(this.l2IndexFileName, l2IndexOffset);
		if(dataOffset == null)
		{
			return null;
		}
		return this.fileSystem.readAt(this.dataFileName, dataOffset);
	}
}

function SpatialIndex(space)
{
	this.space = space;

	this.indexFileExtension = ".index";

	this.getSpace = function()
	{
		return this.space;
	}

	//  returns {path, offset}
	this.hitTest = function(vvector, useNearest)
	{
		var hitTestResult = this.space.hitTest(vvector, useNearest);
		if(!hitTestResult)
		{
			return null;
		}
		return {
			path: String(hitTestResult.ipi) + this.indexFileExtension,
			offset: hitTestResult.ic0,
		};
	}
}

function FileSystem()
{
	this.files = {};

	//  returns the offset of the written value
	this.append = function(path, value)
	{
		var file = this.files[path] || [];
		this.files[path] = file;
		file.push(value);
		return file.length - 1;
	}

	this.writeAt = function(path, offset, value)
	{
		var file = this.files[path] || [];
		this.files[path] = file;
		if(offset >= file.length)
		{
			var delta = offset - file.length;
			Array.prototype.push.apply(file, Array(delta).fill(null));
			file.push(value);
		}
		else
		{
			file[offset] = value;
		}
	}

	this.readAt = function(path, offset)
	{
		var file = this.files[path] || [];
		this.files[path] = file;
		if(offset >= file.length)
		{
			return null;
		}
		return file[offset];
	}
}