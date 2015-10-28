(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.xify = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var jQuery = require('jquery');
var history = require('./lib/jquery.history.js');
var urlInternal = require('./lib/jquery.ba-urlinternal.js');


['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Array'].forEach( 
    function(name) { 
        jQuery['is' + name] = function(obj) {
              return Object.prototype.toString.call(obj) == '[object ' + name + ']';
    };
});


(function($, undefined) {
	//History events & Ajax
	if(window.History){
		module.exports = $;
		var history = window.History;
		$.xify = history;
		//$.xify.options.html4Mode = true;

		//Create an initial Deffered, pretending to be an XHR object, already resolved, to kick things off.
		//The xhr object is global to this plugin so that we can limit requests to one at a time.
		var xhr = $.Deferred().resolve(null);


		var fetch = function(act) {
			if(xhr.state() != 'pending') {

				act.beforeSend = function(xhr, opt) {
					$(window).trigger($.Event('fetching.xify' + act.eventNameSpace, {xhr: xhr, act: act}), xhr);
					//xhr.notify();
					//console.log($.ajaxSettings.xhr());
					//return false;
				}

				act.error = function(xhr, status, error) {
					if(window.console && console.log)
						console.log('xify error:', error);
				}

				act.success = function(data, status, xhr) {
					if(!act.elementMap)
						return;

					//TODO: Make the elementMap replacement much more powerful, 
					//enabling lists of elements to replace each other, appends, prepends, inserts at etc.

					var $html = $('<div>').append($.parseHTML(data));
					//for(var key in act.elementMap) {
					$.each(act.elementMap, function(key, val) {
						//var val = act.elementMap[key];
						var $target = $(val.to || val.from);
						var $replacement = $html.find(val.from).css('display', 'none');
						var replacingEvent = $.Event('replacing.xify', {elementMap: val, original: $target, replacement: $replacement[0]});
						var replacedEvent = $.Event('replaced.xify', {elementMap: val, original: $target, replacement: $replacement[0]});


						$target.trigger(replacingEvent);
						$target.promise().done(function() {
							if($.isArray(val.attr) && val.attr.length > 0) {
								$target.attr(val.attr[0], $replacement.attr(val.attr[1] || val.attr[0]));
								$target.trigger(replacedEvent);
							}
							else if($.isString(val.attr)) {
								$target.attr(val.attr, $replacement.attr(val.attr));
								$target.trigger(replacedEvent);
							}
							else if(!val.attr) {
								$target.replaceWith($replacement);
								$replacement.trigger(replacedEvent);
							}
						});
					});
				}

				xhr = $.ajax(act);
				
				xhr.always(function(dxhr, status, exhr) {
					//console.log(dxhr);
					$(window).trigger($.Event('fetched.xify' + act.eventNameSpace, {xhr: xhr, act: act}), xhr);
				}).done(function(data, status, xhr) {
					//nop
				});
			}

			//act.fetched = true;
			return xhr;
		}

		$(window).on('statechange', function(ev) {
			ev.preventDefault();
			var state = history.getState();
			var act = state.data;

			//Check that this history event has our act data, otherwise ignore it.
			if(state.data && state.data.url && state.data.isXify)
				fetch(act);
			
		});

		$.xify.on = function(ev, el, fn) {
			$(document).on(ev, el, function(ev) {
				ev.preventDefault();
				var state = history.getState();
				var act = null;

				if(xhr.state() != 'pending') {
					act = {type: 'GET'};

					if($.isFunction(fn))
						//act = fn(ev);
						$.extend(act, fn(ev));
					else if($.isString(fn)) {
						act.url = fn;
					}

					act.isXify = true;
					act.actionTrigger = ev.type;
					act.actionElement = el;
					act.eventNameSpace = '';

					//If the request is not a GET and you haven't explicity set fetchSecretly
					//then assume you don't want to update history, and just want to fetch some data.
					if(act.type != 'GET' && act.fetchSecretly == undefined)
						act.fetchSecretly = true;

					//act.context = ev.currentTarget;

					//console.log(act);
					//TODO: Filter act for consistency/serialization, because pushState will serialize it.
					if((act.url == state.url && act.fetchAgain) || act.fetchSecretly)
						fetch(act);
					else
						history.pushState(act, null, act.url);
				}
			});
		}



		// $.xify.on('click', 'a', function(ev) {
		// 	return {type: 'GET', url: $(ev.currentTarget).attr('href'), data: null, 
		// 		elementMap: [{from: '#main'}]};
		// });

		/*$.xify.on('submit', 'form', function(ev) {
			return {type: 'GET', url: $(ev.currentTarget).attr('href'), data: null};
		});*/

		// $(window).on('fetching.xify', function(ev, xhr) {
		// 	//console.log(ev.xhr);

		// 	ev.xhr.done(function(data, status, xhr) {
		// 		//console.log(data);
		// 	});
		// });

		/*$(document).on('submit', 'form', function(ev) {
			ev.preventDefault();
			console.log(ev);
		});*/
	}

})(jQuery);

},{"./lib/jquery.ba-urlinternal.js":"./lib/jquery.ba-urlinternal.js","./lib/jquery.history.js":"./lib/jquery.history.js","jquery":"jquery"}]},{},[1])(1)
});


//# sourceMappingURL=xify.lite.js.map
