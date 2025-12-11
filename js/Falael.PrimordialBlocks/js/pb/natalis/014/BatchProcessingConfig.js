//	R0Q2/daniel/20240509
"use strict";

const { Type } = require("-/pb/natalis/000/Native.js");
const { ArgumentException } = require("-/pb/natalis/003/Exception.js");
const { Enum } = require("-/pb/natalis/011/Enum.js");
const { BufPoolTransaction } = require("-/pb/natalis/013/Compound.js"); 

//	Enumerates all instance handling strategies for `BatchProcessingConfig.elementInstanceHandling`.
const InstanceHandling = Enum("InstanceHandling",
{
	//	Field: Clone an element before modifying, copy non-modified elements; guarantees that the source is not modified by the batch processing.
	CloneModified: Symbol("CloneModified"),
	//	Field: Clone all elements whether modified or not; guarantees that the source is not modified by the batch processing.
	CloneAll: Symbol("CloneAll"),
	//	Field: Modifies existing element instances, guaranteeing that no memory is allocated for new element instances.
	MutateModified: Symbol("MutateModified"),
});

module.exports =

//	Class: Represents configuration for processing batches of elements (for Ex. a list of graph cursors)
class BatchProcessingConfig
{
	//	Parameter: `elementInstanceHandling: InstanceHandling` - optional, defaults to `InstanceHandling.MutateModified`; specifies the strategy used to handle instances of elements that are being processed in a batch.
	//	Parameter: `bufPoolTransaction: BufPoolTransaction` - optional, defaults to `null`; if set, this `bufPoolTransaction` is used by the batch processing for new `buf`/`cbuf` allocation, allowing
	//		post-processing or release of the newly allocated `buf`-s/`cbuf`-s.
	constructor(elementInstanceHandling = InstanceHandling.MutateModified, bufPoolTransaction = null)
	{
		if (!Enum.hasValue(InstanceHandling, elementInstanceHandling)) throw new ArgumentException(0x3FEADD, "elementInstanceHandling", elementInstanceHandling);
		if (!Type.isNU(bufPoolTransaction) && !(bufPoolTransaction instanceof BufPoolTransaction)) throw new ArgumentException(0x5BDB3D, "bufPoolTransaction", bufPoolTransaction);

		this._elementInstanceHandling = elementInstanceHandling;
		this._bufPoolTransaction = bufPoolTransaction;
	}

	//	Property: `elementInstanceHandling: InstanceHandling` - gets the strategy used to handle instances of elements that are being processed in a batch.
	get elementInstanceHandling()
	{
		return this._elementInstanceHandling;
	}

	//	Property: `bufPoolTransaction: BufPoolTransaction` - if set, gets a `bufPoolTransaction` that is used by the batch processing for new `buf`/`cbuf` allocation, allowing
	//		post-processing or release of the newly allocated `buf`-s/`cbuf`-s.
	get bufPoolTransaction()
	{
		return this._bufPoolTransaction;
	}

	//	A default `BatchProcessingConfig` instance with `elementInstanceHandling = InstanceHandling.MutateModified` and `bufPoolTransaction = null`.
	static Default = new BatchProcessingConfig();
}

module.exports.InstanceHandling = InstanceHandling;
module.exports.BatchProcessingConfig = module.exports;
