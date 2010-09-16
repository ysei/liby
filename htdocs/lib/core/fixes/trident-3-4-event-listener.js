(function(){

var doc = document, docelem = doc.documentElement, win = window, undef

if (win.addEventListener || !win.attachEvent)
	return

var eventTransport = doc.__pmc__eventTransport = 'beforeeditfocus'

function elementSupportedEvents () {}
var supportedEvents = elementSupportedEvents.prototype = {abort:1, activate:1, afterprint:1, afterupdate:1, beforeactivate:1, beforecopy:1, beforecut:1, beforedeactivate:1, beforeeditfocus:1, beforepaste:1, beforeprint:1, beforeunload:1, beforeupdate:1, blur:1, bounce:1, cellchange:1, change:1, click:1, contextmenu:1, controlselect:1, copy:1, cut:1, dataavailable:1, datasetchanged:1, datasetcomplete:1, dblclick:1, deactivate:1, drag:1, dragend:1, dragenter:1, dragleave:1, dragover:1, dragstart:1, drop:1, error:1, errorupdate:1, filterchange:1, finish:1, focus:1, focusin:1, focusout:1, hashchange:1, help:1, keydown:1, keypress:1, keyup:1, layoutcomplete:1, load:2, losecapture:1, message:1, mousedown:1, mouseenter:1, mouseleave:1, mousemove:1, mouseout:1, mouseover:1, mouseup:1, mousewheel:1, move:1, moveend:1, movestart:1, offline:1, online:1, page:1, paste:1, progress:1, propertychange:1, readystatechange:1, reset:1, resize:1, resizeend:1, resizestart:1, rowenter:1, rowexit:1, rowsdelete:1, rowsinserted:1, scroll:1, select:1, selectionchange:1, selectstart:1, start:1, stop:1, storage:1, storagecommit:1, submit:2, timeout:1, unload:1}

function scriptSupportedEvents () {}
scriptSupportedEvents.prototype = new elementSupportedEvents()
scriptSupportedEvents.prototype.load = false

var supportedEventsByNodeName =
{
	'SCRIPT': scriptSupportedEvents.prototype
}

var eventConversion = {keypress: 'keydown'}

function getEventTransport (node, type)
{
	return (supportedEventsByNodeName[node.nodeName] || supportedEvents)[type] ? type : eventTransport
}

var Event = win.Event = function () { this.constructor = Event }

Event.prototype =
{
	__updateFromNative: function (e)
	{
		this.type = e.type
		this.clientX = e.clientX
		this.clientY = e.clientY
		this.button = e.button
		this.charCode = e.charCode
		this.keyCode = e.keyCode
		this.currentTarget = this.target = e.srcElement
		this.detail = - e.wheelDelta / 30
		this.pageX = e.clientX + docelem.scrollLeft - document.body.clientLeft // document.body.scrollLeft
		this.pageY = e.clientY + docelem.scrollTop  - document.body.clientTop // document.body.scrollTop
	},
	
	initEvent: function (type, bubbles, cancelable)
	{
		this.type = type
		this.bubbles = bubbles
		this.cancelable = cancelable
		this.timeStamp = +new Date()
	},
	
	preventDefault: function ()
	{
		this.__pmc__event.returnValue = false
		this.defaultPrevented = true
	},
	
	stopPropagation: function ()
	{
		this.__propagationStopped = true
		this.__pmc__event.cancelBubble = true
	}
}

// var DocumentEvent = win.DocumentEvent = function () { this.constructor = DocumentEvent }
// DocumentEvent.prototype = new Event()
var UIEvent = win.UIEvent = function () { this.constructor = UIEvent }
UIEvent.prototype = new Event()
UIEvent.prototype.initUIEvent = function (type, bubbles, cancelable, view, detail)
{
	this.type = type
	this.bubbles = bubbles
	this.cancelable = cancelable
	this.timeStamp = +new Date()
	
	this.view = view
	this.detail = detail
}

var MouseEvent = win.MouseEvent = function () { this.constructor = MouseEvent }
MouseEvent.prototype = new Event()
MouseEvent.prototype.initMouseEvent = function (type, bubbles, cancelable, view, detail, sx, sy, cx, cy, ctrl, alt, shift, meta, button, rTarget)
{
	this.type = type
	this.bubbles = bubbles
	this.cancelable = cancelable
	this.timeStamp = +new Date()
	
	this.view = view
	this.detail = detail
	this.screenX = sx
	this.screenY = sy
	this.clientX = cx
	this.clientY = cy
	
	this.ctrlKey = ctrl
	this.altKey = alt
	this.shiftKey = shift
	this.metaKey = meta
	
	this.button = button
	this.relatedTarget = rTarget
}
var KeyboardEvent = win.KeyboardEvent = function () { this.constructor = KeyboardEvent }
KeyboardEvent.prototype = new Event()
var MutationEvent = win.MutationEvent = function () { this.constructor = MutationEvent }
MutationEvent.prototype = new Event()

var eventConstructors = {Event:Event, /*DocumentEvent:DocumentEvent,*/ UIEvent:UIEvent, MouseEvent:MouseEvent, KeyboardEvent:KeyboardEvent, MutationEvent:MutationEvent}


function getEventWrapper (e, kind)
{
	if (e.__pmc__wrapper)
		return e.__pmc__wrapper
	var w = new (eventConstructors[kind] || Event)()
	w.__updateFromNative(e)
	w.__pmc__event = e
	e.__pmc__wrapper = w
	
	return w
}

document.__pmc__eventListeners = {}
window.__pmc__eventListeners = {}

win.__pmc_dispatchEvent = doc.__pmc_dispatchEvent = Element.prototype.__pmc_dispatchEvent = function (w)
{
	var node = w.target,
		type = w.type
	
	var captures = [], bubbles = [],
		all, byType, listeners
	
	if (node)
	{
		for (; node; node = node.parentNode)
		{
			if ((all = node.__pmc__eventListeners) && (byType = all[type]))
			{
				listeners = byType[0]
				if (listeners)
					bubbles.push(listeners)
			
				listeners = byType[1]
				if (listeners)
					captures.push(listeners)
			}
		}
	}
	else
	{
		if ((all = document.__pmc__eventListeners) && (byType = all[type]))
		{
			listeners = byType[0]
			if (listeners)
				bubbles.push(listeners)
		
			listeners = byType[1]
			if (listeners)
				captures.push(listeners)
		}
	}
	
	if ((all = window.__pmc__eventListeners) && (byType = all[type]))
	{
		listeners = byType[0]
		if (listeners)
			bubbles.push(listeners)
		
		listeners = byType[1]
		if (listeners)
			captures.push(listeners)
	}
	
	// log(captures.length + '/' + bubbles.length)
	
	w.defaultPrevented = false
	w.__propagationStopped = false
	
	for (var i = captures.length - 1; i >= 0; i--)
	{
		var listeners = captures[i]
		
		for (var j = 0, jl = listeners.length; j < jl; j++)
		{
			try
			{
				listeners[j].call(this, w)
			}
			catch (ex)
			{
				// this trick is useful to report errors from all listeners
				// 1000 delay helps to avoid sensitive lag when error reporting is on
				setTimeout(function () { throw ex }, 1000)
			}
		}
		
		if (w.__propagationStopped)
			return
	}
	
	for (var i = 0, il = bubbles.length; i < il; i++)
	{
		var listeners = bubbles[i]
		
		for (var j = 0, jl = listeners.length; j < jl; j++)
		{
			try
			{
				listeners[j].call(this, w)
			}
			catch (ex)
			{
				// this trick is useful to report errors from all listeners
				// 1000 delay helps to avoid sensitive lag when error reporting is on
				setTimeout(function () { throw ex }, 1000)
			}
		}
		
		if (w.__propagationStopped)
			return
	}
}

win.__pmc_getListeners = doc.__pmc_getListeners = Element.prototype.__pmc_getListeners = function (type, dir)
{
	var all = this.__pmc__eventListeners
	if (!all)
		all = this.__pmc__eventListeners = {}
	
	var byType = all[type]
	if (!byType)
	{
		byType = all[type] = []
		this.__pmc__bindCatcher(type, byType)
	}
	
	var listeners = byType[dir]
	if (!listeners)
		listeners = byType[dir] = []
	
	return listeners
}

win.__pmc__bindCatcher = doc.__pmc__bindCatcher = Element.prototype.__pmc__bindCatcher = function (type, byType)
{
	var node = this
	function dispatcher ()
	{
		event.cancelBubble = true
		var w = getEventWrapper(event)
		// check if we got a custom event that does not match our type
		if (type !== w.type)
			return
		
		node.__pmc_dispatchEvent(w)
	}
	
	var transport = getEventTransport(this, type)
	this.attachEvent('on' + transport, dispatcher)
	byType.dispatcher = dispatcher
}

win.__pmc_addEventListener = doc.__pmc_addEventListener = Element.prototype.__pmc_addEventListener = function (type, func, dir)
{
	var listeners = this.__pmc_getListeners(type, dir)
	
	var dup = listeners.indexOf(func)
	if (dup != -1)
		listeners.splice(dup, 1)
	
	listeners.push(func)
}

win.__pmc_detachEvent = doc.__pmc_detachEvent = Element.prototype.__pmc_detachEvent = function (type, func)
{
	var all = this.__pmc__eventListeners
	if (!all)
		return
	
	var listeners = all[type]
	if (!listeners)
		return
	
	var dup = listeners.indexOf(func)
	if (dup != -1)
		listeners.splice(dup, 1)
	
	if (!listeners.length)
	{
		delete all[type]
		var transport = getEventTransport(this, type)
		this.detachEvent('on' + transport, listeners.dispatcher)
	}
}


win.addEventListener = doc.addEventListener = Element.prototype.addEventListener = function (type, func, dir)
{
	type = eventConversion[type] || type
	
	this.__pmc_addEventListener(type, func, dir ? 1 : 0)
}

win.removeEventListener = doc.removeEventListener = Element.prototype.removeEventListener = function (type, func, dir)
{
	type = eventConversion[type] || type
	
	this.__pmc_detachEvent(type, func, dir ? 1 : 0)
}


doc.createEvent = function (kind)
{
	return getEventWrapper(doc.createEventObject(), kind)
}

doc.dispatchEvent = Element.prototype.dispatchEvent = function (w)
{
	var type = w.type,
		transport = getEventTransport(this, type)
	
	w.defaultPrevented = false
	w.target = this
	this.fireEvent('on' + transport, w.__pmc__event)
	return !w.defaultPrevented
}

})();