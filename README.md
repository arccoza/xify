# Xify

Xify is a light weight jquery plugin to ajaxify your site.
Using Xify you can take your current synchronous site, add a sprinkling of javascript, and have 
your pages loading and updating asynchronously, with no specific changes needed on the server side.


## Install

With NPM:
```
npm install xify --save
```
With Bower:
```
bower install xify --save
```


## Use

#### Require and build with Browserify and commonjs **(recommended)**
```
var $ = require('xify'); //require('xify') returns the global jQuery object with its extensions.
```
Browserify will automatically pull in xify's dependencies (`jquery.history.js` and `jquery.ba-urlinternal.js`), 
no mess no fuss, just add your `bundle.js` to your html `<head>`.


#### Globally with `<script>` tags in your html `<head>`
```
<script src="bower_components/xify/build/xify.pack.js"></script>
```
or
```
<script src="node_modules/xify/build/xify.pack.js"></script>
```

You can find Xify files for the browser in `bower_components/xify/build/` or `node_modules/xify/build/` 
You should see:
```
xify.js
xify.pack.js
xify.pack.min.js
```

Xify uses `jquery.history.js` and `jquery.ba-urlinternal.js`, 
which you can find in `bower_components/xify/lib/` or `node_modules/xify/lib/`.

`xify.pack.js` and `xify.pack.min.js` include `jquery.history.js` and `jquery.ba-urlinternal.js` 
bundle in the same file, so you don't have to worry about extra `<script>` tags in your html. 
You only need to include jQuery in your `<head>`, like so:
```
<script src="/bower_components/jquery/dist/jquery.min.js"></script>
```

`xify.js` has nothing bundled with it so you must add `jquery.js`, `jquery.history.js` and `jquery.ba-urlinternal.js` 
to your html `<head>`, like so:
```
<script src="/bower_components/jquery/dist/jquery.min.js"></script>
<script src="/bower_components/xify/lib/jquery.history.js"></script>
<script src="/bower_components/xify/lib/jquery.ba-urlinternal.js"></script>
<script src="/bower_components/xify/build/xify.js"></script>
```


## API

```
$.xify.on(event, selector, callback);
```
Subscribe to any event you like to trigger an async fetch.


`event` any DOM or custom event.

`selector` the CSS selector for the target to watch for the event.

`callback` the function which returns a Xify config object. This function must return an object as described below.

```js
{
  type: 'GET', //The type of ajax request to make (optional, default is GET).
  url: $(ev.currentTarget).attr('href'), //The URL for the request (here we've taken it from an anchor tag).
  elementMap: [{from: '#test-box1'}, {from: 'body', attr: ['class']}] //The map used to replace elements, more below.
}
```
The `elementMap` property descibes what to extract from the html returned by the ajax request and where to put it.
You provide an array of `{from: to: attr: }` objects.

`from` is a selector to grab some element from the returned html.

`to` (optional) is a selector to remove an element from the current page and replace it with 
the element selected with `from`. If `to` is not defined, `from` is used again.

`attr` (optional) If you only want to swap attributes and not the whole element adding this property 
will cause Xify to replace the named attributes on the element only. You provide a string, or an array 
['name','id'] to map from one attribute name to another.

Xify only does replacement, so be sure that your selectors are unique.


## Events

Xify triggers `replacing.xify` before it does a replacement, and `replaced.xify` after the replacement, 
this is triggered on the elements that are being replaced.

You can use these events to modify the replacement processes, mostly useful for animating the replacement.
This is best shown in an example.

## Example

```js
var $ = require('xify');

//Here we use xify to replace content on the page async.
//elementMap maps elements 'from' the new html 'to' the current DOM.
//We are triggering xify on every <a> element with an internal url.
$.xify.on('click', 'a:urlInternal)', function(ev) {
  return {
    type: 'GET',
    url: $(ev.currentTarget).attr('href'), //We extract the ajax URL from the <a> element.
    elementMap: [
      {from: '#test-box1'}, 
      {from: '.test-box2'}, 
      {from: '.test-box3'}, 
      {from: '#test-box4'}, 
      {from: 'body', attr: ['class']}
    ]};
});

var delay = 0;
//Handle xify DOM replace events, use live events by listening on body or document
//this is important because we cannot attach events to elements that we will be replacing.
$(document).on('replacing.xify replaced.xify', 'body', function(ev) {
  var $target = $(ev.target);
  var $replacement = $(ev.replacement); // The replacement element from xify.

  if(ev.type == 'replacing') {
    // Simply increments the delay for each event, creating a staggered replacement.
    delay += 250;
    
    $target.stop(true, true).delay(delay).fadeOut();
    
    if($(ev.target).is('#test-box4')) {
      // Resets the delay counter when we get to the last element, 
      // so that we don't end up with an infitely increasing delay.
      // Assumes the elements are selected in order.
      delay = 0;
    }

    // Hide the replacement element before it is inserted, so that we can animate it
    // in the 'replaced' event.
    $replacement.css('display', 'none');

  }
  else if(ev.type == 'replaced') {
    $target.stop(true, true).fadeIn();
  }
});
```

Run this example yourself from the example/ folder with `node example.js` and point your browser at 
`http://localhost:8080/`
