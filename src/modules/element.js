;(function(){

var R = RegExp, rexCache = {}

Object.add
(
	Element.prototype,
	{
		setClassName: function (cn)
		{
			this.className = cn
			return cn
		},
		
		addClassName: function (cn)
		{
			// this.removeClassName(cn)
			var className = this.className
			if (!className)
				this.className = cn
			else
				this.className = className + ' ' + cn
			return cn
		},
		
		removeClassName: function (cn)
		{
			var className = this.className
			if (className)
			{
				// the following regexp has to be the exact copy of the regexp from hasClassName()
				// because these two methods have the same regexp cache
				this.className = className.replace(rexCache[cn] || (rexCache[cn] = new R('(?:^| +)(?:' + cn + '(?:$| +))+', 'g')), ' ')
										  .replace(/^\s+|\s+$/g, '') // trim
			}
			return cn
		},
		
		toggleClassName: function (cn, state)
		{
			if (arguments.length < 2)
				state = !this.hasClassName(cn)
			
			this.removeClassName(cn)
			if (state)
				this.addClassName(cn)
		},
		
		hasClassName: function (cn)
		{
			var className = this.className
			if (className == cn)
				return true
			
			// the following regexp has to be the exact copy of the regexp from removeClassName()
			// because these two methods have the same regexp cache
			var rex = rexCache[cn]
			if (rex)
				rex.lastIndex = 0
			else
				rex = rexCache[cn] = new R('(?:^| +)(?:' + cn + '(?:$| +))+', 'g')
			
			return rex.test(className)
		},
		
		empty: function ()
		{
			var node
			while (node = this.firstChild)
				this.removeChild(node)
		},
		
		hide: function () { this.addClassName('hidden') },
		show: function () { this.removeClassName('hidden') },
		
		remove: function ()
		{
			var parent = this.parentNode
			return parent ? parent.removeChild(this) : this
		},
		
		isParent: function (parent, root)
		{
			var node = this
			do
			{
				if (node === parent)
					return true
				if (node === root)
					break
			}
			while ((node = node.parentNode))
			
			return false
		},
		
		offsetPosition: function (root)
		{
			var node = this,
				left = 0, top = 0
			
			if (node == root)
				return {left: left, top: top}
			
			var parent, lastNode
			for (;;)
			{
				left += node.offsetLeft
				top += node.offsetTop
				
				parent = node.offsetParent
				if (parent && parent !== root)
				{
					lastNode = node
					node = parent
				}
				else
				{
					if (lastNode)
					{
						left -= lastNode.scrollLeft
						top -= lastNode.scrollTop
					}
					
					break
				}
			}
			
			return {left: left, top: top}
		}
	}
)

})();