
Programica.RollingImages = function () {}

Programica.RollingImages.prototype = new Programica.Widget()
Programica.RollingImages.prototype.mainNodeClassName = 'programica-rolling-images'
Programica.RollingImages.prototype.klass = 'Programica.RollingImages'
Programica.RollingImages.prototype.Handler = function (node)
{
	this.mainNode = node
	this.mainNode.RollingImages = this
	
	this.ns					= this.mainNode.getAttribute('animation-namespace')
	this.viewport			= this.my('viewport')[0]
	this.points				= this.my('point')
	this.buttons			= []
	this.aPrev				= this.my('prev')[0]
	this.aNext				= this.my('next')[0]
	this.current			= null
	
	{
		var bstr = this.mainNode.getAttribute('rolling-images-buttons')
		if (bstr)
		{
			var ids = bstr.split(/\s+/)
			for (var ii = 0; ii < ids.length; ii++)
			{
				if (/^this$/i.test(ids[ii]))
					this.addButtonsFrom(this.mainNode)
				else
					this.addButtonsFrom($(ids[ii]))
			}
		}
		else
			this.addButtonsFrom(this.mainNode)
	}
	
	
	for (var i in this.buttons)
		node.button_num = node.getAttribute('button-num') * 100 || i
	
	//this.buttons = this.buttons.sort(function (a, b) { a.button_num - b.button_num })
	//log(this.buttons)
	
	
	var t = this
	
	this.mousedown_listener = function (e) { t.dragstart(e) }
	this.mousemove_listener = function (e) { t.dragging(e) }
	this.mouseup_listener   = function (e) { t.dragstop(e) }
	
	
	this.viewport.addEventListener('mousedown', this.mousedown_listener, true)
	
	if (/^yes$/i.test(this.mainNode.getAttribute('rolling-images-scroll')))
		this.viewport.addEventListener('DOMMouseScroll', function (e) { e.detail > 0 ? t.goNext() : t.goPrev(); e.preventDefault(); }, false);
	
	if (this.aPrev)
	{
		this.aPrev.onmousedown		= function () { clearInterval(t.nextInt); clearInterval(t.prevInt); t.goPrev(); t.prevInt = setInterval(function () { t.goPrev() }, t.getDuration() * 1000 * 0.5 + 150) }
		this.aPrev.onmouseup		= function () { clearInterval(t.prevInt) }
		this.aPrev.onselectstart	= function () { return false }
	}
	
	if (this.aNext)
	{
		this.aNext.onmousedown		= function () { clearInterval(t.prevInt); clearInterval(t.nextInt); t.goNext(); t.nextInt = setInterval(function () { t.goNext() }, t.getDuration() * 1000 * 0.5 + 150) }
		this.aNext.onmouseup		= function () { clearInterval(t.nextInt) }
		this.aNext.onselectstart	= function () { return false }
	}
	
	for (var i = 0, il = this.buttons.length; i < il; i++)
		//да, в жабаскрипте приходится так изголяться с замыканиями (в IE работает)
		this.buttons[i].onmousedown = function (fi) { return function () { t.goToFrame(fi) } } (i)
}

Programica.RollingImages.prototype.Handler.prototype =
{
	init:			function ()		{ this.goInit() },
	goPrev:			function ()		{ if (this.current > 0) this.goToFrame((this.points.length + this.current - 1) % this.points.length) },
	goNext:			function ()		{ if (this.current < this.points.length - 1) this.goToFrame((this.current + 1) % this.points.length) },
	
	animationType:	function ()		{ return this.mainNode.getAttribute('animation-type') || 'easeOutBack' },
	getDuration:	function ()		{ return this.mainNode.getAttribute('animation-duration') || 1 },
	
	my: function (cn, node)
	{
		var root = (node || this.mainNode)
		cn = this.ns ? (this.ns + "-" + cn) : cn
		return root.getElementsByClassName ? root.getElementsByClassName(cn) : []
	},
	
	goInit: function (n)
	{
		var node = this.my('selected')[0]
		if (node)
			this.goToNode(node, 'directJump')
		else
			this.goToFrame(0, 'directJump')
		
		return n
	},
	
	goToFrame: function (n, anim, dur)
	{
		n = n || 0
		this.goToNode(this.points[n], anim, dur)
		
		return n
	},
	
	goToNode: function (node, anim, dur)
	{
		if (!node) return
		
		log2(this.current + ': offsetTop = ' + node.offsetTop + ', offsetLeft = ' + node.offsetLeft)
		
		var left = null
		var top = null
		var width = null
		var height = null
		
		// поиграем в CSS
		switch (this.mainNode.getAttribute('animation-align') || 'left-top')
		{
			case 'center':
			case 'middle':
				// наводим на центр выбранной ноды
				left = node.offsetLeft + (node.offsetWidth  / 2) - (this.viewport.offsetWidth  / 2)
				top  = node.offsetTop  + (node.offsetHeight / 2) - (this.viewport.offsetHeight / 2)
				break
			
			case 'left-top':
				// лево верх
				left = node.boxObject ? node.boxObject.x : node.offsetLeft
				top  = node.boxObject ? node.boxObject.y : node.offsetTop
				break
			
			case 'right-bottom':
				// право низ
				left = node.offsetLeft + node.offsetWidth  - this.viewport.offsetWidth
				top  = node.offsetTop  + node.offsetHeight - this.viewport.offsetHeight
				break
			
			default:
				log('Unknown animation align type: ' + this.mainNode.getAttribute('animation-align'))
		}
		
		
		{
			var scale = this.viewport.getAttribute("scale")
			
			if (/^(all|height)$/.test(scale))
				height = node.offsetHeight
				
			if (/^(all|width)$/.test(scale))	
				width  = node.offsetWidth
		}
		
		this.animateTo(left, top, width, height, anim, dur)
		
		// меняем номер текущей ноды
		for (var i = 0, il = this.points.length; i < il; i++)
			if (this.points[i] == node) this.setCurrent(i)
	},
	
	animateTo: function (left, top, width, height, anim, dur)
	{
		anim = anim || this.animationType()
		dur  = dur  || this.getDuration()
		
		var trans = {};
		
		if (left != null)
			trans.scrollLeft = left
		
		if (top != null)
			trans.scrollTop = top
		
		if (width != null)
			trans.width = width
		
		if (height != null)
			trans.height = height
		
		
		if (!this.viewport) log2('Viewport is undefined!')
		if (!this.viewport.animate) log2('Viewport can`t be animated!')
		
		this.drop_magnify()
		return this.viewport.animate(anim, trans, dur).start()
	},
	
	jumpTo: function (left, top)
	{
		if (!this.viewport) log2('Viewport is undefined!')
		if (!this.viewport.animate) log2('Viewport can`t be animated!')
		
		this.viewport.scrollLeft = left
		this.viewport.scrollTop = top
		
		//this.findNearest()
	},
	
	updateNavigation: function ()
	{
		var button
		
		Programica.RollingImages.active = this
		
		for (var i = 0, il = this.buttons.length; i < il; i++)
			button = this.buttons[i],
			button.className = button.className.replace(/ selected-button/g, '')
		
		button = this.buttons[this.current]
		if (button)
		{
			button.className = button.className.replace(/ selected-button/g, '')
			button.className += ' selected-button'
		}
		
		if (this.aPrev)
			this.current ? this.aPrev.enable() : this.aPrev.disable()
		
		if (this.aNext)
			this.current < this.points.length - 1 ? this.aNext.enable() : this.aNext.disable()
	},
	
	addButtonsFrom: function (node)
	{
		if (node)
		{
			var btns = this.my('button', node)
			//log(btns)
			this.buttons = this.buttons.concat(btns)
		}
	},
	
	setCurrent: function (num)
	{
		if (num == this.current)
			return
		
		this.current = num
		this.updateNavigation()
		
		if (this.points[this.current] && this.points[this.current].onselect) this.points[this.current].onselect()
	},
	
	findNearest: function ()
	{
		// центр окошка
		var vc_x = this.viewport.scrollLeft + this.viewport.offsetWidth / 2
		var vc_y = this.viewport.scrollTop  + this.viewport.offsetHeight / 2
		
		// минимальное расстояние
		var min = Infinity
		// нода с минимальным расстоянием
		var min_node = null
		// номер минимальной ноды
		var min_i = null
		
		//log(vc)
		for (var i = 0; i < this.points.length; i++)
		{
			// точка
			var node = this.points[i]
			
			// центр точки
			var pc_x = node.offsetLeft + node.offsetWidth / 2
			var pc_y = node.offsetTop  + node.offsetHeight / 2
			
			// ищем расcтояние (гипотинузу — c)
			var c = Math.sqrt( (vc_x - pc_x) * (vc_x - pc_x) + (vc_y - pc_y) * (vc_y - pc_y) )
			
			//log(d)
			
			if (c < min)
			{
				min = c
				min_node = node
				min_i = i
			}
		}
		
		//log(min_i)
		this.setCurrent(min_i)
	},
	
	dragging: function (e)
	{
		e.preventDefault()
		
		// не тащим, если потеряны начальные координаты
		if (!this.di)
			return
		
		// запоминаем мышку
		this.mouse.unshift({x:e.clientX, y:e.clientY, t:new Date()})
		
		// считаем смещение перетаскивания
		this.drag_dx = this.di.mx - e.clientX
		this.drag_dy = this.di.my - e.clientY
		
		// перемещаем под мышку ;)
		this.jumpTo
		(
			this.di.sx + this.drag_dx * this.scrollXpower,
			this.di.sy + this.drag_dy * this.scrollYpower
		)
	},
	
	dragstart: function (e)
	{
		if (!/^(yes|magnify)$/i.test(this.mainNode.getAttribute('rolling-images-grab')))
			return
		
		e.preventDefault()
		
		if (this.viewport.animation)
			this.viewport.animation.stop()
		
		{
			var power = this.mainNode.getAttribute('rolling-images-grab-power')
			power = power ? power.split(/\s+/) : []
			this.scrollXpower = (power[0] || 1)
			this.scrollYpower = power[1] || this.scrollXpower
		}
		
		this.drop_magnify()
		
		// пустой стек позиций мышки
		this.mouse = []
		// запоминаем мышку
		this.mouse.unshift({x:e.clientX, y:e.clientY, t:new Date()})
		
		// начальные координвты мышки и скрола
		this.di = {mx:e.clientX, mx0:e.clientX, my:e.clientY, my0:e.clientY, sx:this.viewport.scrollLeft, sy:this.viewport.scrollTop}
		
		document.addEventListener('mousemove', this.mousemove_listener, true)
		document.addEventListener('mouseup', this.mouseup_listener, true)
		
		this.viewport.addClassName('grabbing')
	},
	
	dragstop: function (e)
	{
		e.preventDefault()
		
		if (this.mouse[6])
			e.stopPropagation()
		
		document.removeEventListener('mousemove', this.mousemove_listener, true);
		document.removeEventListener('mouseup', this.mouseup_listener, true);
		
		this.magnify()
		
		// "энерция"
		var inertia = this.mainNode.getAttribute('rolling-images-grab-inertia')
		if (inertia && this.mouse[3] && new Date() - this.mouse[0].t < 150)
		{
			// арифметически усредняем три последних движения мышью
			var vx = ((this.mouse[1].x - this.mouse[0].x) + (this.mouse[2].x - this.mouse[1].x) + (this.mouse[3].x - this.mouse[2].x)) / 3
			var vy = ((this.mouse[1].y - this.mouse[0].y) + (this.mouse[2].y - this.mouse[1].y) + (this.mouse[3].y - this.mouse[2].y)) / 3
			
			var t = this
			this.animateTo
			(
				// умножаем движение на 3, на инерцию и возводим в степерь 1.2
				this.di.sx + this.drag_dx * this.scrollXpower + (Math.pow(Math.abs(vx * 3 * inertia * this.scrollXpower), 1.2)) * (vx < 0 ? -1 : 1),
				this.di.sy + this.drag_dy * this.scrollYpower + (Math.pow(Math.abs(vy * 3 * inertia * this.scrollYpower), 1.2)) * (vy < 0 ? -1 : 1),
				null, null,
				'easeOutQuad', 0.5 * inertia
			).oncomplete = function () { t.magnify() }
		}
		
		this.di = null
		this.viewport.remClassName('grabbing')
	},
	
	magnify: function ()
	{
		if (/^magnify$/i.test(this.mainNode.getAttribute('rolling-images-grab')))
		{
			var t = this
			this.findNearest()
			this.magnify_timeout = setTimeout
			(
				function () { t.goToFrame(t.current, 'easeInOutQuad') },
				this.mainNode.getAttribute('rolling-images-grab-inertia') ? 150 : 750
			)
		}
	},
	
	drop_magnify: function ()
	{
		if (this.magnify_timeout)
		{
			clearTimeout(this.magnify_timeout)
			this.magnify_timeout = null
		}
	}
}

Programica.Widget.register(new Programica.RollingImages())


document.addEventListener
(
	'keydown',
	function (e)
	{
		if (!Programica.RollingImages.active) return
		
		if (e.ctrlKey)
			switch (e.keyCode)
			{
				case 37:
					Programica.RollingImages.active.goPrev()
					break
				case 39:
					Programica.RollingImages.active.goNext()
					break
			}
	},
	true
)

log2("Widget/RollingImages.js loaded")