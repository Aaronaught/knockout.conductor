// TODO: Support activation events as bindings

(function(ko) {
	var preActivationCallbacks = [];
	var postActivationCallbacks = [];
	var preDeactivationCallbacks = [];
	var postDeactivationCallbacks = [];

	ko.conductor = {
		areas: {},
		nameKey: '@koConductorViewModelName',
		activate: function(areaName, viewModel, viewName, bindingContext) {
			var area = ko.conductor.findArea(areaName);
			if (!area) {
				throw 'Area "' + areaName + '" does not exist.';
			}
			if (!viewName && viewModel) {
				viewName = ko.conductor.findView(viewModel);
			}
			if ((area.activeView == viewName) && (area.activeViewModel === viewModel)) {
				// Already loaded, so skip the rest
				return;
			}
			for (var i = 0; i < preDeactivationCallbacks.length; i++) {
				if (!preDeactivationCallbacks[i](area.element, areaName, area.activeViewModel, area.activeView)) {
					return false;
				}
			}
			for (var i = 0; i < preActivationCallbacks.length; i++) {
				if (!preActivationCallbacks[i](area.element, areaName, viewModel, viewName)) {
					return false;
				}
			}
			ko.conductor.render(area.element, viewModel, viewName, bindingContext);
			for (var i = 0; i < postDeactivationCallbacks.length; i++) {
				postDeactivationCallbacks[i](area.element, areaName, area.activeViewModel, area.activeView);
			}
			for (var i = 0; i < postActivationCallbacks.length; i++) {
				postActivationCallbacks[i](area.element, areaName, viewModel, viewName);
			}
			area.activeView = viewName;
			area.activeViewModel = viewModel;
			return true;
		},
		findArea: function(obj) {
			if (typeof obj === 'string') {
				if (!(obj in ko.conductor.areas)) {
					return null;
				}
				return ko.conductor.areas[obj];
			}
			else if (obj.nodeType > 0) {
				var node = obj;
				while (node) {
					var areaName = node.getAttribute('data-ko-conductor-area');
					if (typeof areaName === 'string') {
						return ko.conductor.findArea(areaName);
					}
					node = node.parentNode;
				}
			}
			return null;
		},
		findView: function(viewModel) {
			if (!viewModel) {
				return null;
			}
			if (!(ko.conductor.nameKey in viewModel)) {
				throw 'Cannot resolve template for view model: Name has not been assigned.';
			}
			var viewModelName = viewModel[ko.conductor.nameKey];
			var lc = viewModelName.toLowerCase();
			if (lc.endsWith('viewmodel')) {
				return viewModelName.substring(0, viewModelName.length - 5);
			}
			var viewName = viewModelName + 'View';
			if (!(viewName in window)) {
				throw 'Cannot resolve template for view model: No template named "' + 
					viewName + '" exists in the current window.';
			}
			return viewName;
		},
		name: function(viewModel, name) {
			if (!viewModel) {
				return null;
			}
			if (!name) {
				return (ko.conductor.nameKey in viewModel) ? 
					viewModel[ko.conductor.nameKey] : null;
			}
			viewModel[ko.conductor.nameKey] = name;
		},
		render: function(areaElement, viewModel, viewName, bindingContext) {
			if (!viewName && !viewModel) {
				ko.utils.setHtml(areaElement, '');
			}
			else {
				ko.renderTemplate(viewName, bindingContext.createChildContext(viewModel),
					null, areaElement, 'replaceChildren');
			}
		},
		activated: function(callback) {
			postActivationCallbacks.push(callback);
		},
		activating: function(callback) {
			preActivationCallbacks.push(callback);
		},
		deactivated: function(callback) {
			postDeactivationCallbacks.push(callback);
		},
		deactivating: function(callback) {
			preDeactivationCallbacks.push(callback);
		}
	};

	ko.bindingHandlers['activate'] = {
		init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			var eventValueAccessor = function () {
				var result = {};
				var value = ko.utils.unwrapObservable(valueAccessor());
				var viewModelToActivate = value.viewModel ? 
					ko.utils.unwrapObservable(value.viewModel) : value;
				var area = value.area ? 
					ko.conductor.findArea(ko.utils.unwrapObservable(value.area)) :
					ko.conductor.findArea(element);
				var viewName = ko.utils.unwrapObservable(value.view);
				return {
					click: function() {
						ko.conductor.activate(area.name, viewModelToActivate, viewName, bindingContext);
					}
				};
			};
			return ko.bindingHandlers['event']['init'].call(this, element, eventValueAccessor, allBindingsAccessor, viewModel, bindingContext);
		},
		update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
		}
	};

	ko.bindingHandlers['area'] = {
		init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			var value = ko.utils.unwrapObservable(valueAccessor());
			while (typeof value === 'function') {
				value = value(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
			}
			var areaName = (typeof value === 'string') ? value : ko.utils.unwrapObservable(value.name);
			if (!areaName) {
				throw 'Area must have a name.';
			}
			element.setAttribute('data-ko-conductor-area', areaName);
			ko.conductor.areas[areaName] = { name: areaName, element: element };
			if (value.defaultViewModel || value.defaultView) {
				setTimeout(function() { ko.conductor.activate(areaName,
					ko.utils.unwrapObservable(value.defaultViewModel),
					ko.utils.unwrapObservable(value.defaultView),
					bindingContext); }, 0);
			}
		}
	};
})(ko);

if (!String.prototype.endsWith) {
	String.prototype.endsWith = function(suffix) {
		return this.indexOf(suffix, this.length - suffix.length) !== -1;
	};
};