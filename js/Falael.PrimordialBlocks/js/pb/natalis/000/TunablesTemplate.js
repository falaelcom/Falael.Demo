//	R0Q2/daniel/20220604
//		- DOC
"use strict";

const PB_tunables =
[
	{ key: 0xEE2A12, domain: "Primordial Blocks", subdomain: "Query", description: "Application-wide enabled-state for query internal caching (Query.js).", defaultValue: true },
	{ key: 0xB275B7, domain: "Primordial Blocks", subdomain: "Compound", description: "The create-time length of the buffers returned by `Compound.BufPool.hold()`, must be larger than or equal to `1` (Compound.js).", defaultValue: 8 },
	{ key: 0x3EEDC9, domain: "Primordial Blocks", subdomain: "Compound", description: "The initial count of buffers precreated by `Compound.BufPool`, must be larger than or equal to `1` (Compound.js).", defaultValue: 512 },
	{ key: 0xA37DF4, domain: "Primordial Blocks", subdomain: "Compound", description: "A factor for automatically expanding the `Compound.BufPool` by the formula `Math.floor(autoGrowthFactor * (this.length + 1))`, must be larger than `1` (Compound.js).", defaultValue: 3 },
	{ key: 0xAB9C26, domain: "Primordial Blocks", subdomain: "Compound", description: "A threshold factor for automatic defragmentation (recycling) of the `Compound.BufPool` as a last measure before expanding the pool, by the formula `fragmentCount > Math.floor(autoRecycleFragmentation * this.length) + 1`, must be larger than or equal to `0` and less than or equal to `0.5` (Compound.js).", defaultValue: 0.3 },
	{ key: 0xDBAF1B, domain: "Primordial Blocks", subdomain: "Compound", description: "`Compound.BufPool` total element count alert threshold, PB_DEBUG-inly (Compound.js).", defaultValue: 10485760 },
	{ key: 0x523EBA, domain: "Primordial Blocks", subdomain: "Compound", description: "Default initial buffer length for `buf, cbuf` (Compound.js).", defaultValue: 8 },
	{ key: 0x7E6183, domain: "Primordial Blocks", subdomain: "GraphCursor", description: "Default initial cursor buffer length for `GraphCursor.Lean` (GraphCursor.js).", defaultValue: 12 },
	{ key: 0xBD1466, domain: "Primordial Blocks", subdomain: "GraphCursor", description: "Default initial cursor buffer length for `GraphCursor.Compact` (GraphCursor.js).", defaultValue: 6 },
	{ key: 0x402757, domain: "Primordial Blocks", subdomain: "GraphCursor", description: "Default initial cursor buffer length for `GraphCursor.CompactFormal` (GraphCursor.js).", defaultValue: 6 },
	{ key: 0x78A43F, domain: "Primordial Blocks", subdomain: "GraphCursor", description: "Default initial cursor list buffer length for `GraphCursor` (GraphCursor.js).", defaultValue: 8 },
	{ key: 0x4B0ECF, domain: "Primordial Blocks", subdomain: "GraphComposer", description: "Default initial actions list buffer length for `GraphComposerTransaction` (GraphCursor.js).", defaultValue: 64 },
	{ key: 0x455307, domain: "Primordial Blocks", subdomain: "Fabric", description: "Array length threshold for selecting `for-in` interation instead of the standard for-loop (Fabric.js); guards against massive iterations through the empty elements in sparse arrays (e.g. `a = []; a[1000000000] = 1`) at the cost of slower iterations of larger non-sparse arrays. Setting thiis tunable to Infinity will effectively turn the safeguard off and might have positive performance impact if no sparse are ever iterated during the lifetime of the application.", defaultValue: 1024 },
	{ key: 0x253AC3, domain: "Primordial Blocks", subdomain: "DiagnosticsCollector", description: "A factor for automatically expanding the `DiagnosticsCollector` trace buffers by the formula `Math.floor(autoGrowthFactor * (this.length + 1))`, must be larger than `1` (DiagnosticsCollector.js).", defaultValue: 2 },
	{ key: 0xE90536, domain: "Primordial Blocks", subdomain: "GraphSchema", description: "Default initial graph schema node buffer length for `GraphSchema.GraphSchemaNode` (GraphSchema.js).", defaultValue: 6 },
];

module.exports =

class TunablesTemplate extends Array
{
	constructor(tunableInfoList = null)
	{
		if (PB_DEBUG)
		{
			if (tunableInfoList && !Array.isArray(tunableInfoList)) throw new Error(`0xB02E17 Argument is invalid: "tunableInfoList".`);
			const visited = new Set();
			if (PB_tunables.concat(tunableInfoList || []).some(v =>
			{
				if (visited.has(v.key)) return true;
				visited.add(v.key);
				return !v.domain ||
					v.domain.constructor !== String ||
					!v.subdomain || 
					v.subdomain.constructor !== String ||
					!Number.isInteger(v.key) ||
					!v.description ||
					v.description.constructor !== String ||
					v.defaultValue === void 0;
			})) throw new Error(`0xEC496D Argument is invalid: "tunableInfoList".`);
		}

		super(...PB_tunables);

		if (tunableInfoList) for (let length = tunableInfoList.length, i = 0; i < length; ++i) this[i] = tunableInfoList[i];
	}

	compose(tunables = null)
	{
		if (PB_DEBUG)
		{
			if (tunables && !(tunables instanceof Object)) throw new Error(`0x59A735 Argument is invalid: "tunables".`);
			for (const key in tunables)
			{
				if (Number.isNaN(Number.parseInt(key))) throw new Error(`0x3B7569 Argument is invalid: "tunables".`);
				if (!this.has(key)) throw new Error(`0x274FCB Argument is invalid: "tunables", related key: ${key}.`);
			}
		}

		const result = {};
		for (let length = this.length, i = 0; i < length; ++i)
		{
			const item = this[i];
			result[item.key] =
			{
				domain: item.domain,
				subdomain: item.subdomain,
				key: item.key,
				description: item.description,
				defaultValue: item.defaultValue,
				value: !tunables || tunables[item.key] === void 0 ? item.defaultValue : tunables[item.key],
			};
		}
		return result;
	}

	has(key)
	{
		return this.findIndex(v => v.key === key) !== -1;
	}
}

module.exports.TunablesTemplate = module.exports;
