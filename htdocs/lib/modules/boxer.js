;(function(){

var myName = 'Boxer'

var Me =
{
	nodesToBoxes: function (root, nodes, width, height)
	{
		var boxes = []
		
		var custom = width !== undefined && height !== undefined
		
		var lastParent = root, position = {left: 0, top: 0}
		for (var i = 0, il = nodes.length; i < il; i++)
		{
			var node = nodes[i],
				parent = node.offsetParent
			
			if (parent != lastParent)
			{
				lastParent = parent
				position = parent.offsetPosition(root)
			}
			
			var box = boxes[i] =
			{
				x: node.offsetLeft + position.left,
				y: node.offsetTop + position.top,
				node: node
			}
			
			if (custom)
			{
				box.w = width
				box.h = height
			}
			else
			{
				box.w = node.offsetWidth
				box.h = node.offsetHeight
			}
		}
		
		return boxes
	},
	
	sameNodesToBoxes: function (root, nodes)
	{
		var first = nodes[0]
		if (!first)
			return []
		
		return this.nodesToBoxes(root, nodes, first.offsetWidth, first.offsetHeight)
	}
}

// Me.mixIn(EventDriven)
Me.className = myName
self[myName] = Me

})();