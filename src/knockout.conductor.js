ko.conductor = {
	areas: {},
	nameKey: '@koConductorViewModelName',
	activate: function(areaName, viewModel, templateName) {
		var area = ko.conductor.findArea(areaName);
		if (!area) {
			throw 'Area "' + areaName + '" does not exist.';
		}
		if (!templateName && viewModel) {
			templateName = ko.conductor.findTemplate(viewModel);
		}
		if (!templateName && !viewModel) {
			ko.utils.setHtml(area.element, '');
		}
		else {
			ko.applyBindingsToNode(area.element, { template: { name: templateName, data: viewModel } });
		}
		area.activeView = templateName;
		area.activeViewModel = areaName;
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
	findTemplate: function(viewModel) {
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
		var templateName = viewModelName + 'View';
		if (!(templateName in window)) {
			throw 'Cannot resolve template for view model: No template named "' + 
				templateName + '" exists in the current window.';
		}
		return templateName;
	},
	name: function(viewModel, name) {
		if (!name) {
			return (ko.conductor.nameKey in viewModel) ? 
				viewModel[ko.conductor.nameKey] : null;
		}
		viewModel[ko.conductor.nameKey] = name;
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
					ko.conductor.activate(area.name, viewModelToActivate, viewName);
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
		var areaName = (typeof value === 'string') ? 
			{ name: value } : ko.utils.unwrapObservable(value.name);
		if (!areaName) {
			throw 'Area must have a name.';
		}
		element.setAttribute('data-ko-conductor-area', areaName);
		ko.conductor.areas[areaName] = { name: areaName, element: element };
		if (value.defaultViewModel || value.defaultView) {
			setTimeout(function() { ko.conductor.activate(areaName,
				ko.utils.unwrapObservable(value.defaultViewModel),
				ko.utils.unwrapObservable(value.defaultView)); }, 0);
		}
	}
};

if (!String.prototype.endsWith) {
	String.prototype.endsWith = function(suffix) {
		return this.indexOf(suffix, this.length - suffix.length) !== -1;
	};
};