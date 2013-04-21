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
			tile: function($container, $currentElement, $transitionElement, position) {
				// Show the transition element "off-screen" and adjust container dimensions
				$transitionElement.show();
				var curWidth = $currentElement.outerWidth();
				var curHeight = $currentElement.outerHeight();
				var transWidth = $transitionElement.outerWidth();
				var transHeight = $transitionElement.outerHeight();
				$container.width(curWidth + transWidth);
				$container.height(Math.max(curHeight, transHeight));

				// Arrange the elements
				$transitionElement.css({
					position: 'absolute',
					width: transWidth + 'px',
					height: transHeight + 'px'
				});
				switch (position) {
					case 'right':
						$transitionElement.css('left', curWidth + 'px');
						break;
					case 'left':
						$currentElement.css('left', transWidth + 'px');
						$container.css('left', -transWidth + 'px');
						break;
				}
			},
			slide: function($container, $currentElement, $transitionElement, duration, easing, initialPosition, transformSelector, callback) {
				ko.conductor.transitions.freeze($container, $currentElement);
				ko.conductor.transitions.tile($container, $currentElement, $transitionElement, initialPosition);
				var transform = transformSelector($container, $currentElement, $transitionElement);
				$container.transition(transform, duration, easing,
					function() {
						ko.conductor.transitions.cleanup($container, $currentElement, $transitionElement);
						if (callback) {
							callback();
						}
					});
			},
			slideLeft: function($container, $currentElement, $transitionElement, duration, easing, callback) {
				ko.conductor.transitions.slide($container, $currentElement, $transitionElement, duration, easing, 'right',
					function() {
						var offset = -$transitionElement.position().left;
						return { x: offset };
					},
					callback);
			},
			slideRight: function($container, $currentElement, $transitionElement, duration, easing, callback) {
				ko.conductor.transitions.slide($container, $currentElement, $transitionElement, duration, easing, 'left',
					function() {
						var offset = $(currentElement).position().left;
						return { x: offset };
					},
					callback);
			},
			transition: function(container, currentElement, transitionElement, type, duration, easing) {
				var $container = $(container);
				var $currentElement = $(currentElement);
				var $transitionElement = $(transitionElement);
				ko.conductor.transitions[type].call(this, $container, $currentElement, $transitionElement, duration, easing,
					function() { $currentElement.remove(); });
			},
		}
	});
	
	ko.conductor.render = function(area, viewModel, viewName, bindingContext) {
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
			ko.conductor.transitions.transition(container, currentElement, element, 'slideLeft', 1000, 'easeOutQuint');
		}
	};
})(ko, jQuery);