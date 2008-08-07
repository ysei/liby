
// defining spaces
if (!self.Programica) self.Programica = {}

function log () {}

// preparing DOM prototypes
if (!self.Element)
	self.Element = {}

if (!self.Element.prototype)
	self.Element.prototype = document.createElement('div').__proto__ || {}

if (!self.HTMLFormElement)
	self.HTMLFormElement = {}

if (!self.HTMLFormElement.prototype)
	self.HTMLFormElement.prototype = document.createElement('form').__proto__ || {}


// base objects extensions
if (!Object.extend)
	Object.extend = function (d, s) { for (var p in s) d[p] = s[p]; return d }

if (!Object.copy)
	Object.copy = function (src) { var dst = {}; for (var k in src) dst[k] = src[k]; return dst }

if (!Math.longRandom)
	Math.longRandom = function () { return (new Date()).getTime().toString() + Math.round(Math.random() * 1E+17) }

if (!String.localeCompare)
	String.localeCompare = function (a, b) { return a < b ? -1 : (a > b ? 1 : 0) }

if (!Array.prototype.forEach)
	Array.prototype.forEach = function (f, inv) { for (var i = 0, len = this.length; i < len; i++) f.call(inv, this[i], i, this) }

if (!Array.prototype.map)
	Array.prototype.map = function(f, inv)
	{
		var len = this.length,
			res = new Array(len)
		for (var i = 0; i < len; i++)
			if (i in this)
				res[i] = f.call(inv, this[i], i, this)
		return res
	}

if (!Array.copy)
	Array.copy = function (src) { var dst = []; for (var i = 0, len = src.length; i < len; i++) dst[i] = src[i]; return dst }

if (!Function.prototype.delay)
	Function.prototype.delay = function (delay, args, inv) { var me = this; return setTimeout(function () { return me.apply(inv, args || arguments) }, delay || 10) }

if (!Function.prototype.bind)
	Function.prototype.bind = function (inv, args) { var me = this; return function () { me.apply(inv, args || arguments) } }


function $   (id)   { return document.getElementById(id) }
function $E  (type, props)
{
	var node = document.createElement(type)
	if (props)
		for (var i in props)
			node.setAttribute(i, props[i])
	return node
}

$.onload = function (fn) { return self.addEventListener('load', fn, false) }
$.include = function (src)
{
	var me = arguments.callee
	var cache = me.cache || (me.cache = {}) 
	if (me.cache[src])
		return me.cache[src]
	var node = document.createElement('script')
	node.type = 'text/javascript'
	node.src = src
	document.getElementsByTagName('head')[0].appendChild(node)
	cache[src] = node
	return node
}

