function ShellViewModel() {
	var self = this;
	ko.conductor.name(self, 'ShellViewModel');
	self.home = ko.observable(new HomeViewModel());
	self.messages = ko.observable();
	self.settings = ko.observable();
}