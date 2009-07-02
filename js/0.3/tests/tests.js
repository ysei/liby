;(function(){

var doc = document, outputNode

function startup ()
{
	outputNode = doc.createElement('ul')
	outputNode.id = 'tests-output'
	document.body.appendChild(outputNode)
}

function node (cn, m, desc, list)
{
	var row = doc.createElement(list !== false ? 'li' : 'div')
	row.className = 'result ' + cn
	row.appendChild(doc.createTextNode(m))
	if (desc)
	{
		var d = doc.createElement('pre')
		d.className = 'description'
		d.appendChild(doc.createTextNode(desc))
		row.appendChild(d)
	}
	outputNode.appendChild(row)
}

var escapeChars = {'"': '\\"', '\\': '\\\\', '\n': '\\n', '\r': '\\r', '\t': '\\t'}
function escapeString (str)
{
	return str.replace(/(["\\\n\r\t])/g, function (v) { return escapeChars[v] })
}

var level = 0, indc = '	'
function inspect (val)
{
	if (level++ > 10)
		throw new Error('inspecting too deep: ' + inspect.level)
	
	var res, ind = new Array(level).join(indc)
	try
	{
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
				else if (val.constructor === Array)
				{
					var elements = []
					for (var i = 0, il = val.length; i < il; i++)
						elements.push(inspect(val[i]))
					res = (level > 1 ? '\n\r' : '') + ind + '[\n\r' + ind + indc + elements.join(',\n\r' + ind + indc) + '\n\r' + ind + ']'
					break
				}
				else if (val.constructor === Object)
				{
					var elements = []
					for (var k in val)
						elements.push(inspect(k) + ': ' + inspect(val[k]))
					res = (level > 1 ? '\n\r' : '') + ind + '{\n\r' + ind + indc + elements.join(',\n\r' + ind + indc) + '\n\r' + ind + '}'
					break
				}
			default:
				res = String(val)
		}
	}
	catch (ex) { throw new Error('error inspecting "' + val + '":' + ex) }
	
	level--
	return res
}

window.addEventListener('load', startup, false)

var times = {}

var myName = 'tests', Me = self[myName] =
{
	planed: 0,
	tests: 0,
	fails: 0,
	skiped: 0,
	skips: [],
	
	plan: function (planed, skips)
	{
		this.planed = planed
		if (skips)
			this.skip(skips)
	},
	skip: function (s)
	{
		var skips = this.skips || (this.skips = {})
		if (s)
			for (var i = 0; i < s.length; i++)
				skips[s[i]] = true
		else
			skips[this.tests+1] = true
	},
	
	fail: function (m, d)
	{
		this.tests++
		if (this.skips['*'] || this.skips[this.tests])
		{
			this.skiped++
			node('skip', m, d)
		}
		else
		{
			this.fails++
			node('fail', m, d)
		}
	},
	
	success: function (m, d)
	{
		this.tests++
		node('success', m, d)
	},
	
	info: function (m, d) { node('info', m, d, false) },
	log: function (m, d) { node('log', m, d, false) },
	
	eq: function (a, b, m) { return a === b ? this.success(m) : this.fail(m, inspect(a) + ' !== ' + inspect(b)) },
	ne: function (a, b, m) { return a !== b ? this.success(m) : this.fail(m, inspect(a) + ' === ' + inspect(b)) },
	eqo: function (a, b, m)
	{
		return inspect(a) === inspect(b) ? this.success(m) : this.fail(m, 'a: ' + inspect(a) + '\n\rb: ' + inspect(b))
	},
	ok: function (v, m) { return v ? this.success(m) : this.fail(m, 'not ok: ' + inspect(v)) },
	
	
	time: function (name)
	{
		return times[name] = new Date()
	},
	
	timeEnd: function (name)
	{
		var date = new Date(),
			diff = date - times[name]
		this.info(name + ': ' + diff + 'ms')
		return diff
	},
	
	done: function ()
	{
		this.log('done: ' + this.tests + ', planed: ' + this.planed + ', failed: ' + this.fails + ', skiped: ' + this.skiped)
		outputNode.className += this.fails || this.planed > 0 && this.tests !== this.planed ? 'failed' : 'successful'
	}
}

var m, ua = navigator.userAgent

Me.ua =
	((m = /(MSIE) (\d+\.?\d*)/.exec(ua)) && m[0]) ||
	((m = /(Firefox)\/(\d+\.\d+)/.exec(ua)) && m[1]+' '+m[2]) ||
	((m = /(Opera)\/(\d+\.\d)/.exec(ua)) && m[1]+' '+m[2]) ||
	((m = /Version\/(\d+\.\d) (Safari)\//.exec(ua)) && m[2]+' '+m[1])

})();
