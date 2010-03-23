;(function(){

var myName = 'Tool'

function Me (parent)
{
	this.parent = parent
}

var proxyList = ['wait', 'done', 'test', 'async', 'expect', 'failing', 'mayFail', 'pass', 'fail']

var prototype =
{
	log: function (m) { return this.parent.reporter.log(m) },
	info: function (m) { return this.parent.reporter.info(m) },
	
	ok: function (v, d)
	{
		if (v)
			this.pass([v, 'is true'], d)
		else
			this.fail([v, 'is not true'], d)
	},
	
	no: function (v, d)
	{
		if (!v)
			this.pass([v, 'is false'], d)
		else
			this.fail([v, 'is not false'], d)
	},
	
	eq: function (a, b, d)
	{
		if (a === b)
			this.pass([a, '===', b], d)
		else
			this.fail([a, '!==', b], d)
	},
	
	ne: function (a, b, d)
	{
		if (a !== b)
			this.pass([a, '!==', b], d)
		else
			this.fail([a, '===', b], d)
	},
	
	eqo: function (a, b, d)
	{
		if (this.inspect(a, 10, true) === this.inspect(b, 10, true))
			this.pass([a, '===', b], d)
		else
			this.fail([a, '!==', b], d)
	},
	
	neo: function (a, b, d)
	{
		if (this.inspect(a, 10, true) !== this.inspect(b, 10, true))
			this.pass([a, '!==', b], d)
		else
			this.fail([a, '===', b], d)
	},
	
	lt: function (a, b, d)
	{
		if (a < b)
			this.pass([a, '<', b], d)
		else
			this.fail([a, '>=', b], d)
	},
	lte: function (a, b, d)
	{
		if (a <= b)
			this.pass([a, '<=', b], d)
		else
			this.fail([a, '>', b], d)
	},
	gte: function (a, b, d)
	{
		if (a >= b)
			this.pass([a, '>=', b], d)
		else
			this.fail([a, '<', b], d)
	},
	gt: function (a, b, d)
	{
		if (a > b)
			this.pass([a, '>', b], d)
		else
			this.fail([a, '<=', b], d)
	},
	
	instance: function (a, b, d)
	{
		if (a instanceof b)
			this.pass([a, 'instanceof', b], d)
		else
			this.fail([a, 'is not instanceof', b], d)
	},
	notinstance: function (a, b, d)
	{
		if (!(a instanceof b))
			this.pass([a, 'is not instanceof', b], d)
		else
			this.fail([a, 'instanceof', b], d)
	},
	
	type: function (a, b, d)
	{
		if (typeof a === b)
			this.pass([a, 'typeof', b], d)
		else
			this.fail([a, 'is not typeof', b], d)
	},
	nottype: function (a, b, d)
	{
		if (!(typeof a === b))
			this.pass([a, 'is not typeof', b], d)
		else
			this.fail([a, 'typeof', b], d)
	},
	
	exception: function (f, c, d)
	{
		if (typeof c !== 'function')
			d = c,
			c = null
		
		try
		{
			f(this)
		}
		catch (ex)
		{
			this.pass(['exception was thrown', ex], d)
			if (c)
				c(this, ex)
			return
		}
		
		this.fail('no exception was thrown', d)
	},
	noexception: function (f, d)
	{
		try
		{
			f(this)
		}
		catch (ex)
		{
			this.fail(['exception was thrown', ex], d)
			return
		}
		
		this.pass('no exception was thrown', d)
	},
	
	_times: {},
	time: function (name)
	{
		return this._times[name] = new Date()
	},
	
	timeEnd: function (name)
	{
		var diff = new Date() - this._times[name]
		this.info((name || 'time') + ': ' + diff + 'ms')
		return diff
	},
	
	speed: function (f)
	{
		var count = 1
		do
		{
			count *= 5
			var begin = new Date()
			for (var i = 0; i < count; i++)
				f()
			var diff = new Date() - begin
		}
		while (diff < 25)
		
		var speed = count * 1000 / diff
		return speed
	}
}

function proxyParent (name) { return function () { return this.parent[name].apply(this.parent, arguments) } }

for (var i = 0; i < proxyList.length; i++)
{
	var name = proxyList[i]
	prototype[name] = proxyParent(name)
}

Me.prototype = prototype
self.Test[myName] = Me

})();

;(function(){

var escapeChars = {'"': '\\"', '\\': '\\\\', '\n': '\\n', '\r': '\\r', '\t': '\\t'}
function escapeString (str)
{
	return str.replace(/(["\\\n\r\t])/g, function (v) { return escapeChars[v] })
}

if (!Array.prototype.indexOf)
Array.prototype.indexOf = function(v, i)
{
	var len = this.length,
		i = +i || 0
	i = (i < 0) ? (Math.ceil(i) + len) : Math.floor(i)

	for (; i < len; i++)
		if (i in this && this[i] === v)
			return i
	return -1
}


var myName = 'Inspector'
function Me ()
{
	this.seen = []
}

Me.prototype =
{
	deep: 1,
	hard: false,
	level: 0,
	indc: '	',
	
	inspect: function (val, deep, hard)
	{
		if (deep !== undefined)
			this.deep = deep
		if (hard !== undefined)
			this.hard = hard
		
		try
		{
			return this.walk(val)
		}
		catch (ex)
		{
			throw new Error('error inspecting "' + val + '":' + ex)
		}
	},
	
	walk: function (val)
	{
		if (++this.level > this.deep)
			if (this.hard)
				throw new Error('inspecting too deep: ' + this.level)
			else
				this.deepest = true
		
		var res, ind = new Array(this.level).join(this.indc)
		switch (typeof val)
		{
			case 'string':
				res = '"' + escapeString(val) + '"'
				break
			
			case 'object':
				if (val === null)
				{
					res = 'null'
					break
				}
				
				if (val.constructor === Date)
				{
					res = val.toString() + ' (' + (+val) + ')'
					break
				}
				
				if (val.constructor === RegExp)
				{
					res = val.toString()
					break
				}
				
				// remember complex objects
				var seen = this.seen, num = seen.indexOf(val)
				if (num >= 0)
					return '#' + num
				seen.push(val)
				
				if (val.constructor === Array)
				{
					if (this.deepest)
					{
						res = '[…]'
						break
					}
					
					var elements = []
					for (var i = 0, il = val.length; i < il; i++)
						elements.push(this.walk(val[i]))
					res = (this.level > 1 ? '\n\r' : '') + ind + '[\n\r' + ind + this.indc + elements.join(',\n\r' + ind + this.indc) + '\n\r' + ind + ']'
					break
				}
				
				// any other Object
				{
					if (this.deepest)
					{
						res = '{…}'
						break
					}
					
					var keys = []
					for (var k in val)
						keys.push(k)
					keys.sort()
					
					var elements = []
					for (var i = 0, il = keys.length; i < il; i++)
					{
						var k = keys[i]
						elements.push(this.walk(k) + ': ' + this.walk(val[k]))
					}
					res = (this.level > 1 ? '\n\r' : '') + ind + '{\n\r' + ind + this.indc + elements.join(',\n\r' + ind + this.indc) + '\n\r' + ind + '}'
					break
				}
			
			case 'function':
				if (!(res = val.className))
					res = String(val)
				break
			
			default:
				res = String(val)
		}
		
		this.level--
		return res
	}
}

self[myName] = Me

Test.Tool.prototype.inspect = function (val)
{
	var me = new Me()
	return me.inspect.apply(me, arguments)
}


})();