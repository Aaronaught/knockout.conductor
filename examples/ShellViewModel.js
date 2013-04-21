function ShellViewModel() {
	var self = this;
	ko.conductor.name(self, 'ShellViewModel');
	self.home = ko.observable(new HomeViewModel());
	self.messages = ko.observable(new MessagesViewModel());
	self.settings = ko.observable(new SettingsViewModel());
	
	self.selectTransition = function(viewModel, oldViewName, newViewName) {
		var effect = (newViewName == 'HomeView') ? 'slideRight' : 'slideLeft';
		return { effect: effect, duration: 1000, easing: 'easeOutQuint' };
	};
}