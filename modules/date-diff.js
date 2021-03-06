;(function(){

var units2seconds =
{
	s: 1000,
	m: 6e4,
	h: 36e5,
	d: 864e5,
	w: 7 * 864e5,
	y: 365 * 864e5
}

var DateDiff =
{
	parse: function (str)
	{
		var m = /^([+-])?(\d+(?:\.\d+)?)([smhdwy])?$/.exec(str)
		if (!m)
			return null
		
		return [m[1] || '+', +m[2], m[3] || 's']
	},
	
	compute: function (diff)
	{
		var s = Math.round(diff[1] * units2seconds[diff[2]])
		return diff[0] == '-' ? -s : s
	},
	
	add: function (str)
	{
		return new Date().add(str)
	}
}

var Date_prototype =
{
	add: function (str)
	{
		return new Date(+this + DateDiff.compute(DateDiff.parse(str)))
	}
}

Liby.carefullyExtend(Date.prototype, Date_prototype)

Liby.DateDiff = DateDiff

})();
