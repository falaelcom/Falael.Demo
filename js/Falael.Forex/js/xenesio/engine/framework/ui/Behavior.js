"use strict";

include("StdAfx.js");

class Behavior
{
	//	browserEventTypes: EBrowserEventType
	constructor(element)
	{
		this._element = element;

		this._enabled = false;
		this._enabledEvents = new Map();
	}

	get browserEventTypes()
	{
		return this._browserEventTypes;
	}

	get element()
	{
		return this._element;
	}

	get acceptRoleList()
	{
		return this._acceptRoleList;
	}

	get enabled()
	{
		return this._enabled;
	}

	set enabled(value)
	{
		if (this._enabled == value)
		{
			return;
		}

		if (value)
		{
			for (var kvp of this._enabledEvents)
			{
				this._attachEventHandler(kvp[0]);
			}
		}
		else
		{
			for (var kvp of this._enabledEvents)
			{
				this._detachEventHandler(kvp[0]);
			}
		}

		this._enabled = value;
	}

	enableEventRole(browserEventType, role)
	{
		var eventRoles = this._enabledEvents.get(browserEventType);
		if (!eventRoles)
		{
			eventRoles = [];
			this._enabledEvents.set(browserEventType, eventRoles);
			if (this._enabled)
			{
				this._attachEventHandler(browserEventType);
			}
		}
		else if (eventRoles.indexOf(role) != -1)
		{
			//throw "Already enabled " + role + ".";
			return;
		}
		if (role == "*")
		{
			eventRoles.unshift(role);
		}
		else
		{
			eventRoles.push(role);
		}
	}

	disableEventRole(browserEventType, role)
	{
		var eventRoles = this._enabledEvents.get(browserEventType);
		if (!eventRoles)
		{
			throw "Not enabled " + role + ".";
		}
		var foundAt = eventRoles.indexOf(role);
		if (foundAt == -1)
		{
			throw "Not enabled " + role + ".";
		}
		if (role == "*")
		{
			eventRoles.shift();
		}
		else
		{
			eventRoles.splice(foundAt, 1);
		}
		if (!eventRoles.length)
		{
			this._enabledEvents.delete(browserEventType);
			if (this._enabled)
			{
				this._detachEventHandler(browserEventType);
			}
		}
	}

	_testElement(browserEventType, element)
	{
		var enabledRoles = this._enabledEvents.get(browserEventType);
		if (!enabledRoles)
		{
			return false;
		}

		for (var length = enabledRoles.length, i = 0; i < length; ++i)
		{
			var role = enabledRoles[i];
			if (role == "*")
			{
				return true;
			}
			var currentElement = element;
			while (currentElement && currentElement.getAttribute)
			{
				var elementRole = currentElement.getAttribute("rl");
				if (elementRole == role)
				{
					return true;
				}
				currentElement = currentElement.parentElement;
			}
		}

		return false;
	}

	_attachEventHandler(browserEventType)
	{
		var flagName = EBrowserEventType.getFlagName(browserEventType);
		switch (browserEventType)
		{
			case EBrowserEventType.MouseUp:
			case EBrowserEventType.MouseMove:
			case EBrowserEventType.KeyDown:
			case EBrowserEventType.KeyUp:
				var instanceMethod = this["_bound_window_" + flagName];
				if (!instanceMethod)
				{
					instanceMethod = this["_window_" + flagName].bind(this);
					this["_bound_window_" + flagName] = instanceMethod;
				}
				window.addEventListener(flagName.toLowerCase(), instanceMethod);
				break;
			default:
				var instanceMethod = this["_bound_element_" + flagName];
				if (!instanceMethod)
				{
					instanceMethod = this["_element_" + flagName].bind(this);
					this["_bound_element_" + flagName] = instanceMethod;
				}
				this._element.addEventListener(flagName.toLowerCase(), instanceMethod);
				break;
		}
	}

	_detachEventHandler(browserEventType)
	{
		var flagName = EBrowserEventType.getFlagName(browserEventType);
		switch (browserEventType)
		{
			case EBrowserEventType.MouseUp:
			case EBrowserEventType.MouseMove:
			case EBrowserEventType.KeyDown:
			case EBrowserEventType.KeyUp:
				var instanceMethod = this["_bound_window_" + flagName];
				if (!instanceMethod)
				{
					throw "Invalid operation.";
				}
				window.removeEventListener(flagName.toLowerCase(), instanceMethod);
				break;
			default:
				var instanceMethod = this["_bound_element_" + flagName];
				if (!instanceMethod)
				{
					throw "Invalid operation.";
				}
				this._element.removeEventListener(flagName.toLowerCase(), instanceMethod);
				break;
		}
	}

	static _lookupControl(element)
	{
		if (!element)
		{
			return null;
		}

		var item = element;
		while (item)
		{
			if (item.control)
			{
				return item.control;
			}

			item = item.parentNode;
		}
		return null;
	}

	static lookupAscendentWithRole(element, role)
	{
		var currentElement = element;
		while (currentElement && currentElement.getAttribute)
		{
			var elementRole = currentElement.getAttribute("rl");
			if (elementRole == role)
			{
				return currentElement;
			}
			currentElement = currentElement.parentElement;
		}
		return null;
	}

	//	event handlers
	_toMouseEventArgs(type, e)
	{
		var boundingDocumentRect = window.getBoundingDocumentRect(this._element);
		return {
			type: type,

			control: Behavior._lookupControl(e.target),
			sender: this._element,
			element: e.target,
			x: e.pageX,
			y: e.pageY,
			deltaX: e.movementX,
			deltaY: e.movementY,

			keys: { altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey },
			button: e.button,

			relatedControl: Behavior._lookupControl(e.relatedTarget),
			relatedElement: e.relatedTarget,

			localX: e.pageX - boundingDocumentRect.x,
			localY: e.pageY - boundingDocumentRect.y,
			windowX: e.clientX,
			windowY: e.clientY,
			screenX: e.screenX,
			screenY: e.screenY,
		};
	}

	_element_MouseDown(event)
	{
		if (!this._testElement(EBrowserEventType.MouseDown, event.target))
		{
			return;
		}
		this.__onMouseDown(this._toMouseEventArgs(EBrowserEventType.MouseDown, event));
	}

	_window_MouseUp(event)
	{
		if (!this._testElement(EBrowserEventType.MouseUp, event.target))
		{
			return;
		}
		this.__onMouseUp(this._toMouseEventArgs(EBrowserEventType.MouseUp, event));
	}

	_window_MouseMove(event)
	{
		if (!this._testElement(EBrowserEventType.MouseMove, event.target))
		{
			return;
		}
		this.__onMouseMove(this._toMouseEventArgs(EBrowserEventType.MouseMove, event));
	}

	_element_MouseOver(event)
	{
		if (!this._testElement(EBrowserEventType.MouseOver, event.target))
		{
			return;
		}
		this.__onMouseOver(this._toMouseEventArgs(EBrowserEventType.MouseOver, event));
	}

	_element_MouseOut(event)
	{
		if (!this._testElement(EBrowserEventType.MouseOut, event.target))
		{
			return;
		}
		this.__onMouseOut(this._toMouseEventArgs(EBrowserEventType.MouseOut, event));
	}

	_element_MouseEnter(event)
	{
		if (!this._testElement(EBrowserEventType.MouseEnter, event.target))
		{
			return;
		}
		this.__onMouseEnter(this._toMouseEventArgs(EBrowserEventType.MouseEnter, event));
	}

	_element_MouseLeave(event)
	{
		if (!this._testElement(EBrowserEventType.MouseLeave, event.target))
		{
			return;
		}
		this.__onMouseLeave(this._toMouseEventArgs(EBrowserEventType.MouseLeave, event));
	}

	_element_Wheel(event)
	{
		if (!this._testElement(EBrowserEventType.Wheel, event.target))
		{
			return;
		}
		var eventArgs = this._toMouseEventArgs(EBrowserEventType.Wheel, event);
		eventArgs.deltaX = - event.deltaX / Math.abs(event.deltaX);
		eventArgs.deltaY = - event.deltaY / Math.abs(event.deltaY);
		if (this.__onWheel(eventArgs))
		{
			event.preventDefault();
		}
	}


	_element_Click(event)
	{
		if (!this._testElement(EBrowserEventType.Click, event.target))
		{
			return;
		}
		this.__onClick(this._toMouseEventArgs(EBrowserEventType.Click, event));
	}

	_element_DblClick(event)
	{
		if (!this._testElement(EBrowserEventType.DblClick, event.target))
		{
			return;
		}
		this.__onDblClick(this._toMouseEventArgs(EBrowserEventType.DblClick, event));
	}

	_element_ContextMenu(event)
	{
		if (!this._testElement(EBrowserEventType.ContextMenu, event.target))
		{
			return;
		}
		this.__onContextMenu(this._toMouseEventArgs(EBrowserEventType.ContextMenu, event));
	}


	_toTouchEventArgs(type, e)
	{
		//	https://developer.mozilla.org/en-US/docs/Web/API/Touch
		throw "Not implemented.";
	}

	_element_TouchStart(event)
	{
		throw "Not implemented."; //	filtering would be more complex for touch events
		if (!this._testElement(EBrowserEventType.TouchStart, event.target))
		{
			return;
		}
		this.__onTouchStart(this._toTouchEventArgs(EBrowserEventType.TouchStart, event));
	}

	_element_TouchMove(event)
	{
		throw "Not implemented."; //	filtering would be more complex for touch events
		if (!this._testElement(EBrowserEventType.TouchMove, event.target))
		{
			return;
		}
		this.__onTouchMove(this._toTouchEventArgs(EBrowserEventType.TouchMove, event));
	}

	_element_TouchEnd(event)
	{
		throw "Not implemented."; //	filtering would be more complex for touch events
		if (!this._testElement(EBrowserEventType.TouchEnd, event.target))
		{
			return;
		}
		this.__onTouchEnd(this._toTouchEventArgs(EBrowserEventType.TouchEnd, event));
	}

	_element_TouchCancel(event)
	{
		throw "Not implemented."; //	filtering would be more complex for touch events
		if (!this._testElement(EBrowserEventType.TouchCancel, event.target))
		{
			return;
		}
		this.__onTouchCancel(this._toTouchEventArgs(EBrowserEventType.TouchCancel, event));
	}


	_toKeyboardEventArgs(type, e)
	{
		return {
			type: type,

			control: Behavior._lookupControl(e.currentTarget),
			sender: e.currentTarget,
			element: e.target,

			code: e.code,
			character: e.key,

			keys: { altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey },
		};
	}

	_element_KeyDown(event)
	{
		if (!this._testElement(EBrowserEventType.KeyDown, event.target))
		{
			return;
		}
		this.__onKeyDown(this._toKeyboardEventArgs(EBrowserEventType.KeyDown, event));
	}

	_element_KeyUp(event)
	{
		if (!this._testElement(EBrowserEventType.KeyUp, event.target))
		{
			return;
		}
		this.__onKeyUp(this._toKeyboardEventArgs(EBrowserEventType.KeyUp, event));
	}

	_window_KeyDown(event)
	{
		this.__onKeyDown(this._toKeyboardEventArgs(EBrowserEventType.KeyDown, event));
	}

	_window_KeyUp(event)
	{
		this.__onKeyUp(this._toKeyboardEventArgs(EBrowserEventType.KeyUp, event));
	}

	//	overridables
	__onMouseDown(args)
	{
	}

	__onMouseUp(args)
	{
	}

	__onMouseMove(args)
	{
	}

	__onMouseOver(args)
	{
	}

	__onMouseOut(args)
	{
	}

	__onMouseEnter(args)
	{
	}

	__onMouseLeave(args)
	{
	}

	__onWheel(args)
	{
	}
	

	__onClick(args)
	{
	}

	__onDblClick(args)
	{
	}

	__onContextMenu(args)
	{
	}


	__onTouchStart(args)
	{
	}

	__onTouchMove(args)
	{
	}

	__onTouchEnd(args)
	{
	}

	__onTouchCancel(args)
	{
	}


	__onKeyDown(args)
	{
	}

	__onKeyUp(args)
	{
	}
}
