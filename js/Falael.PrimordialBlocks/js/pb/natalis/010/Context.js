//	R0Q3?/daniel/20220915
//		- DOC
//		- TEST luid, timens/node, timens/web
"use strict";

const { Runtime } = require("-/pb/natalis/000/Runtime.js");
const { Type, CallableType } = require("-/pb/natalis/000/Native.js");
const { TunablesTemplate } = require("-/pb/natalis/000/TunablesTemplate.js");
const { ArgumentException, InvalidOperationException, NotSupportedException } = require("-/pb/natalis/003/Exception.js");

let _pristine = true;
let _config, _version, _logger, _guid, _sleep, _timens, _tunablesTemplate, _tunables;
let _log, _luid, _esc, _heap = {};
let _hrtime_buffer = new Array(2);

module.exports =
{
	configure(par)
	{
		if (PB_DEBUG)
		{
			if (!Type.isObject(par)) throw new ArgumentException(0xA4FF53, "par", par);

			if (!Type.isNU(par.config) && !Type.isObject(par.config)) throw new ArgumentException(0xFF4EEA, "par.config", par.config);
			if (!Type.isObject(par.logger)) throw new ArgumentException(0x421A2D, "par.logger", par.logger);
			if (!CallableType.isFunction(par.logger.trace)) throw new ArgumentException(0x7D67C5, "par.logger.trace", par.logger.trace);
			if (!CallableType.isFunction(par.guid)) throw new ArgumentException(0x33C3DB, "par.guid", par.guid);
			if (!CallableType.isFunction(par.esc)) throw new ArgumentException(0xC6A47A, "par.esc", par.esc);

			if (!Type.isNU(par.luid) && !CallableType.isFunction(par.luid)) throw new ArgumentException(0x2D55CB, "par.luid", par.luid);
			if (!Type.isNU(par.sleep) && !CallableType.isFunction(par.sleep)) throw new ArgumentException(0x55896F, "par.sleep", par.sleep);
			if (!Type.isNU(par.tunablesTemplate) && !(par.tunablesTemplate instanceof TunablesTemplate)) throw new ArgumentException(0x201505, "par.tunablesTemplate", par.tunablesTemplate);
			if (!Type.isNU(par.tunables) && !Type.isObject(par.tunables)) throw new ArgumentException(0x791F34, "par.tunables", par.tunables);
		}

		if (!_pristine) throw new InvalidOperationException(0xF33F91);

		_version = par.version;
		_config = par.config;
		_logger = par.logger;
		_log = _logger.trace.bind(_logger);
		_guid = par.guid;
		_esc = par.esc;

		_sleep = par.sleep || _sleepWithTimeout;
		if (par.luid) _luid = par.luid;
		else
		{
			_luid = _newLuidGenerator(true);
			_luid.newGenerator = _newLuidGenerator;
		}

		if (par.timens) _timens = par.timens;
		else
		{
			if (Runtime.supports("Process:hrtime")) _timens = __timens_node;
			else if (Runtime.supports("performance:now")) _timens = __timens_web;
			else _timens = function timens() { throw new NotSupportedException(0x5F1C3D); }
		}

		_tunablesTemplate = par.tunablesTemplate || new TunablesTemplate();
		_tunables = _tunablesTemplate.compose(par.tunables);

		_pristine = false;

		function __timens_node(ns)
		{
			if (PB_DEBUG)
			{
				if (ns !== void 0 && Number.isNaN(ns)) throw new ArgumentException(0xDCAD0F, "ns", ns);
			}
			if (ns === void 0)
			{
				const hrtime = process.hrtime();
				return hrtime[0] * 1e9 + hrtime[1];
			}
			_hrtime_buffer[0] = Math.floor(ns / 1e9);
			_hrtime_buffer[1] = ns % 1e9;
			const hrtime = process.hrtime(_hrtime_buffer);
			return hrtime[0] * 1e9 + hrtime[1];
		}

		function __timens_web(ns)
		{
			if (PB_DEBUG)
			{
				if (ns !== void 0 && Number.isNaN(ns)) throw new ArgumentException(0x69A863, "ns", ns);
			}
			const nowns = Math.round(performance.now() * 1e6);
			return ns === void 0 ? nowns : nowns - ns;
		}
	},

	get version()
	{
		if (PB_DEBUG)
		{
			if (_pristine) throw new InvalidOperationException(0x12A743);
		}
		return _version;
	},

	get config()
	{
		if (PB_DEBUG)
		{
			if (_pristine) throw new InvalidOperationException(0xE3F683);
		}
		return _config;
	},

	get logger()
	{
		if (PB_DEBUG)
		{
			if (_pristine) throw new InvalidOperationException(0xF32DE6);
		}
		return _logger;
	},

	get guid()
	{
		if (PB_DEBUG)
		{
			if (_pristine) throw new InvalidOperationException(0x13C4AC);
		}
		return _guid;
	},

	get luid()
	{
		if (PB_DEBUG)
		{
			if (_pristine) throw new InvalidOperationException(0xCAD03A);
		}
		return _luid;
	},

	get log()
	{
		if (PB_DEBUG)
		{
			if (_pristine) throw new InvalidOperationException(0x3BC046);
		}
		return _log;
	},

	get esc()
	{
		if (PB_DEBUG)
		{
			if (_pristine) throw new InvalidOperationException(0x9007D7);
		}
		return _esc;
	},

	get sleep()
	{
		if (PB_DEBUG)
		{
			if (_pristine) throw new InvalidOperationException(0x7850B3);
		}
		return _sleep;
	},

	get timens()
	{
		if (PB_DEBUG)
		{
			if (_pristine) throw new InvalidOperationException(0xE8EB51);
		}
		return _timens;
	},

	get tunables()
	{
		if (PB_DEBUG)
		{
			if (_pristine) throw new InvalidOperationException(0x227404);
		}
		return _tunables;
	},

	tunable(ncode)
	{
		if (PB_DEBUG)
		{
			if (_pristine) throw new InvalidOperationException(0x8F99DC);
			if (!Number.isInteger(ncode)) throw new ArgumentException(0x10FD28, "ncode", ncode);
			if (_tunables[ncode] === void 0) throw new ArgumentException(0x725CD9, "ncode", ncode, "; tunable not found");
		}
		return _tunables[ncode].value;
	},

	get heap()
	{
		if (_pristine) throw new InvalidOperationException(0x94107F);
		return _heap;
	},

	get pristine()
	{
		return _pristine;
	},
}

function _newLuidGenerator(forceStringResult)
{
	if (PB_DEBUG)
	{
		if (!Type.isBoolean(forceStringResult)) throw new ArgumentException(0x37A111, "forceStringResult", forceStringResult);
	}

	let _luidCounter = 0;
	let _luidOverflow = false;
	return function luid()
	{
		++_luidCounter;
		if (_luidCounter === 0)
		{
			if (_luidOverflow) return forceStringResult ? String(_guid()) : _guid();
			_logger.warn(`0xEDE1BD Local unique identifier (luid) counter overflown for this process, switching to global unique identifier (guid) generation. This can potentially have a negative effect on the application performance.`);
			_luidOverflow = true;
			return forceStringResult ? String(_guid()) : _guid();
		}
		else if (_luidCounter >= Number.MAX_SAFE_INTEGER) _luidCounter = Number.MIN_SAFE_INTEGER;
		return forceStringResult ? String(_luidCounter) : _luidCounter;
	};
}

async function _sleepWithTimeout(durationMs)
{
	if (PB_DEBUG)
	{
		if (!Type.isInteger(durationMs)) throw new ArgumentException(0x808E2A, "durationMs", durationMs);
	}
	return new Promise(r => setTimeout(() => r(), durationMs));
}

module.exports.Context = module.exports;

Object.freeze(module.exports);
Object.freeze(_luid);
