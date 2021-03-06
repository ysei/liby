;(function(){

var handlersProp = '__EventDrivenHandlers'

function EventDriven () {}

EventDriven.prototype =
{
	addEventListener: function (type, listener, capture)
	{
		var handlers = this[handlersProp]
		if (!handlers)
		{
			// bake all in two steps
			handlers = this[handlersProp] = {}
			handlers[type] = [listener]
			return
		}
		
		var harr = handlers[type]
		if (!harr)
		{
			handlers[type] = [listener]
			return
		}
		
		var i = harr.indexOf(listener)
		if (i != -1)
			return
		
		harr.push(listener)
	},
	
	removeEventListener: function (type, listener, capture)
	{
		var handlers = this[handlersProp]
		if (!handlers)
			return
		
		var harr = handlers[type]
		if (!harr)
			return
		
		var i = harr.indexOf(listener)
		if (i == -1)
			return
		
		harr.splice(i, 1)
	},
	
	dispatchEvent: function (type, e)
	{
		if (typeof type == 'string')
		{
			if (!e)
				e = {}
			
			e.type = type
		}
		else
			e = type
		
		e.__dispatched = true
		
		var handlers = this[handlersProp]
		if (!handlers)
			return true
		
		var harr = handlers[e.type]
		if (!harr)
			return true
		
		var len = harr.length
		if (!len)
			return true
		
		for (var i = 0; i < len; i++)
			harr[i].call(this, e)
		
		return !e.defaultPrevented
	}
}

Liby.EventDriven = EventDriven



function Event () {}

Event.prototype =
{
	bubbles: true,
	cancelable: true,
	
	preventDefault: function ()
	{
		if (this.__dispatched && this.cancelable)
			this.defaultPrevented = true
	},
	
	stopPropagation: function ()
	{
		this.propagationStopped = true
	},
	
	initEvent: function (type, bubbles, cancelable)
	{
		this.type = type
		this.bubbles = bubbles
		this.cancelable = cancelable
	}
}

Liby.EventDriven.Event = Event

})();
