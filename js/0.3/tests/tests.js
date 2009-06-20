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
		for (var i = 0; i < s.length; i++)
			skips[s[i]] = true
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
	
	eq: function (a, b, m, s) { a === b ? this.success(m) : this.fail(m, 'a: "' + a + '"\n\rb: "' + b + '"', s) },
	eqarr: function (a, b, m, s)
	{
		good:
		{
			if (a.length !== b.length)
				break good
			for (var i = 0; i < a.length; i++)
				if (!(a[i] === b[i]))
					break good
			
			return this.success(m)
		}
		
		this.fail(m, 'a: [' + a.join(', ') + ']\n\rb: [' + b.join(', ') + ']', s)
	},
	ok: function (v, m, s) { v ? this.success(m) : this.fail(m, '"' + v + '"', s) },
	
	
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
		outputNode.className += this.fails || this.tests !== this.planed ? 'failed' : 'successful'
	}
}

var m, ua = navigator.userAgent

Me.ua =
	((m = /(MSIE) (\d+\.?\d*)/.exec(ua)) && m[0]) ||
	((m = /(Firefox)\/(\d+\.\d+)/.exec(ua)) && m[1]+' '+m[2]) ||
	((m = /(Opera)\/(\d+\.\d)/.exec(ua)) && m[1]+' '+m[2]) ||
	((m = /Version\/(\d+\.\d) (Safari)\//.exec(ua)) && m[2]+' '+m[1])

})();
