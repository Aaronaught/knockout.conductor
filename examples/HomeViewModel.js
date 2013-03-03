function HomeViewModel() {
	var self = this;
	ko.conductor.name(self, 'HomeViewModel');
	self.name = ko.observable('Joe Plumber');
	self.unreadMessageCount = ko.observable(7);
}