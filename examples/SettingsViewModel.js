function SettingsViewModel() {
	var self = this;
	ko.conductor.name(self, 'SettingsViewModel');
	self.themeName = ko.observable();
}