function MessagesViewModel() {
	var self = this;
	ko.conductor.name(self, 'MessagesViewModel');
	self.items = ko.observableArray([
		{ from: 'John Smith', receivedOn: new Date(2013, 0, 26), subject: 'Answer me already!', unread: true },
		{ from: 'John Smith', receivedOn: new Date(2013, 0, 21), subject: 'Are you still alive?', unread: true },
		{ from: 'Bob Jones', receivedOn: new Date(2013, 0, 20), subject: 'Staff meeting tomorrow', unread: true },
		{ from: 'John Smith', receivedOn: new Date(2013, 0, 19), subject: 'Where you at?', unread: true },
		{ from: 'Jane Doe', receivedOn: new Date(2013, 0, 19), subject: 'Re: family day party', unread: true },
		{ from: 'BEST DRUGS FOR ERECTION', receivedOn: new Date(2013, 0, 18), subject: '75% discount off V!AgR4 C!aL1S...', unread: true },
		{ from: 'John Smith', receivedOn: new Date(2013, 0, 18), subject: 'Fwd: How\'s it going?', unread: true },
		{ from: 'Jane Doe', receivedOn: new Date(2013, 0, 16), subject: 'family day party', unread: false },
		{ from: 'John Smith', receivedOn: new Date(2013, 0, 16), subject: 'How\'s it going?', unread: false },
		{ from: 'pdiddy@hotmail.com', receivedOn: new Date(2013, 0, 16), subject: 'Re: Invoice #153', unread: false },
		{ from: 'Jerry', receivedOn: new Date(2013, 0, 16), subject: 'BeEst!CheapWathches%Check AdOVFIwmupjB', unread: false },
		{ from: 'Fun Girl', receivedOn: new Date(2013, 0, 15), subject: 'Get immense rod for yourself', unread: false }
	]);
}