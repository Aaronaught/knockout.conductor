// TODO: Support activation events as bindings

(function(ko, $) {
	$.extend(ko.conductor, {
		transitions: {
			viewClassName: 'view',
			viewTagName: 'div',
			cleanup: function($container, $currentElement, $transitionElement) {
				$currentElement.hide().css({
					position: '',
					width: '',
					height: '',
					left: ''
				});
				$container.css({
					x: 0,
					width: '',
					height: '',
					left: ''
				});
				$transitionElement.css({
					position: '',
					width: '',
					height: '',
					left: ''
				});
			},
			freeze: function($container, $currentElement) {
				var curWidth = $currentElement.width();
				var curHeight = $currentElement.height();
				
				// Make the container just big enough for its current element, so that
				// the transition element will be entirely hidden by overflow.
				$container.width(curWidth).height(curHeight);
				
				// Convert the current element to be absolutely positioned
				$currentElement.css({
					position: 'absolute',
					width: curWidth + 'px',
					height: curHeight + 'px'
				});
			},
			tile: function($container, $currentElement, $transitionElement, position, padding) {
				// Show the transition element "off-screen" and adjust container dimensions
				$transitionElement.show();
				var maxWidth = $container.width();
				var maxHeight = $transitionElement.height();
				var curWidth = $currentElement.outerWidth();
				var curHeight = $currentElement.outerHeight();
				var transWidth = $transitionElement.outerWidth();
				var transHeight = $transitionElement.outerHeight();
				$container.width(curWidth + transWidth + padding);
				$container.height(Math.max(curHeight, transHeight));

				// Arrange the elements
				$transitionElement.css({
					position: 'absolute',
					width: maxWidth + 'px',
					height: maxHeight + 'px'
				});
				switch (position) {
					case 'right':
						$transitionElement.css('left', curWidth + padding + 'px');
						break;
					case 'left':
						$currentElement.css('left', (transWidth + padding) + 'px');
						$container.css('left', -(transWidth + padding) + 'px');
						break;
				}
			},
			slide: function($container, $currentElement, $transitionElement, duration, easing, initialPosition, padding, transformSelector, callback) {
				ko.conductor.transitions.freeze($container, $currentElement);
				ko.conductor.transitions.tile($container, $currentElement, $transitionElement, initialPosition, padding);
				var transform = transformSelector($container, $currentElement, $transitionElement);
				$container.transition(transform, duration, easing,
					function() {
						ko.conductor.transitions.cleanup($container, $currentElement, $transitionElement);
						if (callback) {
							callback();
						}
					});
			},
			slideLeft: function($container, $currentElement, $transitionElement, padding, duration, easing, callback) {
				ko.conductor.transitions.slide($container, $currentElement, $transitionElement, duration, easing, 'right', padding,
					function() {
						var offset = -$transitionElement.position().left;
						return { x: offset };
					},
					callback);
			},
			slideRight: function($container, $currentElement, $transitionElement, padding, duration, easing, callback) {
				ko.conductor.transitions.slide($container, $currentElement, $transitionElement, duration, easing, 'left', padding,
					function() {
						var offset = $currentElement.position().left;
						return { x: offset };
					},
					callback);
			},
			transition: function(container, currentElement, transitionElement, type, duration, easing) {
				var $container = $(container);
				var $currentElement = $(currentElement);
				var $transitionElement = $(transitionElement);
				ko.conductor.transitions[type].call(this, $container, $currentElement, $transitionElement, 30, duration, easing,
					function() { $currentElement.remove(); });
			},
		}
	});
	
	var oldRender = ko.conductor.render;
	ko.conductor.render = function(area, viewModel, viewName, bindingContext) {
		var allBindings = ko.bindingProvider.instance.getBindings(area.element, bindingContext);
		var transitionBinding = allBindings.transition;
		if (!transitionBinding) {
			return oldRender(area, viewModel, viewName, bindingContext);
		}
		var transition = (typeof transitionBinding === 'function') ?
			transitionBinding(viewModel, area.activeView, viewName) : 
			transitionBinding;
		if (typeof transition === 'string') {
			transition = { effect: transition };
		};
		var container = $(area.element).find('div.transitionContainer').get(0);
		if (!container) {
			var containerHtml = '<div class="transitionContainer" style="position: relative" />';
			$(area.element).wrapInner(containerHtml);
			container = $(area.element).find('div.transitionContainer').get(0);
		}
		if (!viewName && !viewModel) {
			ko.utils.setHtml(container, '');
		}
		else {
			var element = document.createElement(ko.conductor.transitions.viewTagName);
			element.className = ko.conductor.transitions.viewClassName;
			ko.renderTemplate(viewName, bindingContext.createChildContext(viewModel),
				null, element, 'replaceChildren');
			var currentElement = $(container).find(ko.conductor.transitions.viewTagName + '.' + ko.conductor.transitions.viewClassName).get(0);
			if (!currentElement) {
				$(container).html('').append(element);
				return;
			}
			element.style.display = 'none';
			$(container).append(element);
			ko.conductor.transitions.transition(container, currentElement, element, transition.effect, transition.delay, transition.easing);
		}
	};
})(ko, jQuery);