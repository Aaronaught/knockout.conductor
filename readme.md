Knockout.Conductor
==================

**Knockout.Conductor** is an implementation of the Conductor pattern (AKA Screen Conductor), a composition design pattern for the very common scenario where multiple views or screens share a single container.

It is modeled loosely after the Conductor in Caliburn Micro; the [Caliburn documentation](http://caliburnmicro.codeplex.com/wikipage?title=Screens,%20Conductors%20and%20Composition) contains much more information on the theory behind the Screen Conductor and its specific implementation.

The most common use cases for the Conductor are:

* Tabbed Interfaces
* Billboards/slideshows
* Shells (i.e. navigation in a [single-page application](http://en.wikipedia.org/wiki/Single-page_application))
* Wizards and card layouts

Essentially any UI composition pattern based on polymorphism or duck typing benefits (a lot) from a flexible Conductor.

What makes the Conductor particularly different from what Knockout already does via its `template` binding is that the Conductor is meant to handle *different views*, which is very different from simply pumping an observable into a static template.

To put it another way: Templates expose different *data* or *entities* whereas Conductors can expose different *features* or *screens*.

##Getting started

###Component View Model

Because JavaScript doesn't have a particularly reliable metadata system, you'll need to name your view model. Fortunately, instead of forcing you to implement a specific property name, Knockout.Conductor provides a utility method which stores it in a reserved field to keep it private:

```javascript
function HomeViewModel() {
    ko.conductor.name(this, 'HomeViewModel');
    // ...
}
```

###Container View Model

Although Knockout.Conductor doesn't care where or how you connect your components together, a good place to start is to align your component hierarchy to the view hierarchy:

```javascript
function ShellViewModel() {
	this.home = new HomeViewModel();
	this.messages = new MessagesViewModel();
	this.settings = new SettingsViewModel();
}
```

You could also make all of the above properties observables if you wanted to dynamically load the components; in the above case I'm assuming that the components are always loaded.

###Declaring the Area

It's easy, just use the `area` binding:

```html
<div data-bind="area: 'main'">...</div>
```

It doesn't matter *where* in the markup your container is. KO.Conductor indexes areas by name so it can find them anywhere; for this reason it's usually best to use a plain string for the area name as opposed to an observable or function.

KO.Conductor won't initially touch the content of the area container, so you can add any placeholder content you want for graceful degradation.

###Activating a Component

Simply use the `activate` binding and use the same area name:

```html
<a href="#" data-bind="activate: { viewModel: home, area: 'main' }"></a>
```

Note, the above assumes that you are activating from somewhere *outside* the area. If the control is already *inside* the conducted area (one example might be the Next and Previous buttons on a Wizard page), then you can use the following shortcut instead:

```html
<a href="#" data-bind="activate: home"></a>
```

KO.Conductor uses a convention-based system for finding the view based on the view model. If the name ends in `ViewModel` then it removes the `Model` suffix, so `HomeViewModel` would become `HomeView`. Otherwise, it appends a `View` suffix, so `Home` would also become `HomeView`. You can override the convention if you like; see the following sections.

###Creating the View

Last but not least, you need the actual view. KO.Conductor hooks into Knockout's templating system so this is just a matter of declaring a script template with the view name as the ID:

```html
<script id="HomeView" type="text/html">
    <p>Welcome,
      <span data-bind="text: name"></span>!
    </p>
</script>
```

You're done! See the examples for something a little more comprehensive and concrete.

---

##View Models are Optional

Although most of your content is probably already dynamic if you've chosen to use Knockout, you can load static views into an area if you want to by specifying the view name:

```html
<a href="#" data-bind="activate: { view: 'help', area: 'main' }">Help</a>
```

##Default Views/View Models

When you declare an area, you have the option of specifying an initial view, view model, or both, to load:

```html
<div data-bind="area: { name: 'main', defaultViewModel: home, defaultView: 'HomeView'">...</div>
```

This will cause KO.Conductor to load the specified view model and/or view when the page is first loaded, after other bindings are applied.

##Overriding View Resolution

If you don't like the convention KO.Conductor uses for resolving view names, change it!

The function is `ko.conductor.findView`, which takes one parameter, `viewModel`, and returns the view name. Simply replace it with another function to change the behaviour.

You can use the utility function `ko.conductor.name(viewModel)` to get the view model's name, if it has one.

##Retrieving Current State

You can retrieve the state of any area using `ko.conductor.findArea(obj)`, where `obj` is either a string representing the area name, or a DOM object within the area.

Whenever KO.Conductor changes the active component in an area, it sets the `area.activeView` and `area.activeViewModel` properties. You can use these to save in a cookie, URL fragment, etc.

##Activation/Deactivation Events

Knockout.Conductor allows you to intercept the activation and deactivation of views before and after they happen. Register the callbacks like so:

```javascript
// Runs after activation
ko.conductor.activated(function(element, area, viewModel, view) { ... });

// Runs before activation
ko.conductor.activating(function(element, area, viewModel, view) { return true; });

// Runs after deactivation
ko.conductor.deactivated(function(element, area, viewModel, view) { ... });

// Runs before deactivation
ko.conductor.deactivating(function(element, area, viewModel, view) { return true; });
```

The `activating` and `deactivating` events also act as guards; you can prevent the activation/deactivation from happening by simply returning `false` or anything falsy from the callback. You do not need to return anything from the `activated` and `deactivated` callbacks.

In all of these callbacks, the parameters are the same:

* `element` is the actual HTML element containing the area. You can use this to perform DOM manipulation.
* `area` is the name of the area being targeted, e.g. `'main'`.
* `viewModel` is the view model object being activated or deactivated.
* `view` is the name of the view being activated or deactivated.

##What's Missing?

This is still a work in progress. It doesn't have a lot of the features that the CM Conductor has. Right now the road map is:

* Eliminating the requirement to "name" view models
* Integration with [Sammy.js](http://sammyjs.org/) and/or similar frameworks
* Specifications/unit tests for all the functionality

Other ideas are welcome, of course; feel free to submit an issue.