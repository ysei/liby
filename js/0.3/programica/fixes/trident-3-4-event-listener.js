(function(){

var doc = document, win = window, undef

if (win.addEventListener || !win.attachEvent)
	return

function onBeforeUnload ()
{
	var stack = onBeforeUnload.stack
	for (var i = 0, il = stack.length; i < il; i++)
	{
		var el = stack[i]
		el[0].detachEvent(el[1], el[2])
	}
	onBeforeUnload.stack = []
}
onBeforeUnload.stack = []
window.attachEvent('onbeforeunload', onBeforeUnload)

var eventConversion = { DOMMouseScroll: 'mousewheel', unload: 'beforeunload' }

function preventDefault ()
{
	var old = this.returnValue
	this.returnValue = false
	return old
}

function stopPropagation ()
{
	var old = this.cancelBubble
	this.cancelBubble = true
	return old
}

function getEventWrapper (node, type, func, dir)
{
	var pmc_uid = 'pmc::uniqueID'
	node[pmc_uid] = node[pmc_uid] || node.uniqueID
	var key = '__IEEventWrapper:' + type + ':' + dir + ':' + node[pmc_uid]
	
	if (func[key])
		return func[key]
	else
	{
		var wrapper = func[key] = function (e)
		{
			if (e === undef)
				e = event
			e.currentTarget = e.target = e.srcElement
			e.preventDefault  = preventDefault
			e.stopPropagation = stopPropagation
			e.detail = - e.wheelDelta / 30
			e.pageX = e.clientX + doc.documentElement.scrollLeft - doc.body.clientLeft // doc.body.scrollLeft
			e.pageY = e.clientY + doc.documentElement.scrollTop  - doc.body.clientTop // doc.body.scrollTop
			func.call(node, e)
		}
		wrapper.isIEEventWrapper = true
		return wrapper
	}
}

function wrapOnEvent (node, ontype)
{
	var type = ontype.replace(/^on/, '')
	if (node[ontype] && !node[ontype].isIEEventWrapper)
		node[ontype] = getEventWrapper(node, type, node[ontype], false)
}

win.addEventListener = doc.addEventListener = Element.prototype.addEventListener = function (type, func, dir)
{
	dir = dir || false
	type = eventConversion[type] || type
	
	var wrapper = getEventWrapper(this, type, func, dir)
	if (wrapper)
		this.detachEvent('on' + type, wrapper)
	
	if (type == 'change' && this.tagName == 'FORM')
	{
		if (!this.onchange)
			this.onchange = function (e)
			{
				for (var i = 0; i < this.onchange.stack.length; i++)
					this.onchange.stack[i].call(this, e || window.event)
			}
		
		if (!this.onchange.stack)
			this.onchange.stack = []
		
		this.onchange.stack.push(wrapper)
	}
	else
	{
		this.attachEvent('on' + type, wrapper)
		onBeforeUnload.stack.push([this, 'on' + type, wrapper])
	}
}

win.removeEventListener = doc.removeEventListener = Element.prototype.removeEventListener = function (type, func, dir)
{
	dir = dir || false
	if (eventConversion[type])
		type = eventConversion[type]
	
	var wrapper = getEventWrapper(this, type, func, dir)
	if (wrapper)
		this.detachEvent('on' + type, wrapper)
}


// fix for onload call order bug
{
	var onLoadListeners = win.__iefixes_onLoadListeners = []
	
	win.addEventListenerReal = win.addEventListener
	win.addEventListener = function (type, func, dir)
	{
		if (type == 'load')
		{
			this.removeEventListener(type, func, dir)
			onLoadListeners.push(func)
		}
		else
			this.addEventListenerReal(type, func, dir)
		
		return func
	}
	
	win.removeEventListenerReal = win.removeEventListener
	win.removeEventListener = function (type, func, dir)
	{
		if (type == 'load')
		{
			for (var i = 0; i < onLoadListeners.length; i++)
			{
				if (onLoadListeners[i] != func)
					onLoadListeners[i] = null
			}
		}
		else
			this.removeEventListenerReal(type, func, dir)
		
		return func
	}
	
	// we have already done the wrapper job
	win.addEventListenerReal
	(
		'load',
		function (e)
		{
			for (var i = 0; i < onLoadListeners.length; i++)
			{
				var listener = onLoadListeners[i]
				if (listener)
					listener(e)
			}
		},
		true
	)
}

function initEvent (type, bubbles, cancelable)
{
	this.type = type
	this.bubbles = bubbles
	this.cancelable = cancelable
}
doc.createEvent = function ()
{
	var ne = doc.createEventObject()
	ne.initEvent = initEvent
	return ne
}

doc.dispatchEvent = Element.prototype.dispatchEvent = function (e)
{
	if (e.type == 'change')
		return this.onchange && this.onchange(e)
	else
		return this.fireEvent(e.type, e)
}


win.IEEventListener =
{
	getEventWrapper: getEventWrapper
}

})();