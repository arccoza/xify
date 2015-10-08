// (function($) {
	
// 	// DOM Ready
// 	$(document).ready(function() {
// 		// jQuery Code
// 		//console.log('document ready');

// 		console.log(History);

// 		//History events & Ajax
// 		if(window.history.pushState){
// 			var history = window.History;
// 			var oldState = history.getState();
// 			var newState = null;
// 			var fromUrl = oldState.url;
// 			var toUrl = null;
// 			var toTitle = '';
// 			var htmlContentRegex = /<body(.*)>((\s|.)*)<\/body>/gi;
// 			var headOpenRegex = /<head(.*)>/i;
// 			var headCloseRegex = /<\/head>/i;
// 			var htmlScriptsRegex = /<script(?:.*)>(?:.*)<\/script>/gi;
// 			var page = null;

// 			var updatePage = function() {
// 				//$('#page').replaceWith($('<div>').html(page.replace(htmlScriptsRegex, '')).find('#page').css('opacity', 0.5));
// 				//$('#page').replaceWith($('<div>').html(page).find('#page').css('opacity', 0.5));
// 				//console.log(toUrl);
// 				var $pageNext = $('<div>').html(page);

// 				$('#main').promise().done(function(){
// 					$(this).replaceWith($pageNext.find('#main').css('top', '400px'));

// 					$('#page').attr('class', $pageNext.find('#page').attr('class'));
// 					//console.log();

// 					if($pageNext.find('#page').hasClass('page-template-page-event-php')){
// 						var $bg = $('.bg-layers');
// 						var $bgLayerNext = $pageNext.find('.bg-layers > .bg-layer').css('display', 'none');

// 						/*$bg.find('.bg-layer').fadeOut(600, function() {
// 							$(this).remove();
// 						});*/

// 						$bg.append($bgLayerNext);

// 						$('nav#event-bar').replaceWith($pageNext.find('nav#event-bar'));
// 					}

					

					

					

// 					$(window).trigger('ajaxify.pageUpdated');
// 				});

				
// 				//$bgLayerNext.fadeIn(600);
// 				/*$('#page').find('script').each(function(i, el) {
// 					console.log(el.src);
// 					var s = $(el).replaceWith('<div id="ajaxify-ijsr">');
// 					console.log(s);
// 					$('#ajaxify-ijsr').replaceWith(s);
// 				});*/
// 				//$('#page').append('<script type="text/javascript">alert("hello");</script>')
// 				//$(window).trigger('ajaxify.pageUpdated');
// 			}

// 			var changeState = function(data, title, url) {
// 				oldState = history.getState();
// 				history.pushState(data, title, url);
// 				$(window).trigger('ajaxify.stateChanged');
// 			}

// 			var loadPage = function(url) {
// 				if($.isUrlExternal(url) || ~url.indexOf('wp-admin') || ~url.indexOf('wp-login'))
// 					return;

// 				$(window).trigger('ajaxify.urlRequest');

// 				$.get(url, function(data, status, jqXhr){
// 					//console.log(data, status, jqXhr);
// 					if(jqXhr.status == 200){
// 						page = data;
// 						//changeState({}, '', url);
// 						updatePage();
// 					}
// 					else {
// 						page = null;
// 						window.location = oldState.url;
// 					}
// 				}, 'html');

// 				return;
// 			}

// 			var processLinkAction = function(ev) {
// 				ev.preventDefault();
// 				var $el = $(ev.currentTarget);
// 				toUrl = $el.attr('href');

// 				changeState({}, '', toUrl);
// 			}

			
// 			$(window).on('ajaxify.urlRequest', function(ev) {
// 				//console.log('loading');
// 				//$('#page').animate({opacity: 0.5}, 200);
// 				$('#main').velocity({'top': 400}, 500);
// 				//$('.')
// 				//$('.loading-bar').css('display', 'block');
// 			}).on('ajaxify.pageUpdated', function(ev) {
// 				//console.log('finished');
// 				//$('#page').animate({opacity: 1}, 300);
// 				$('#main').velocity({'top': 0}, 1000, 'easeOutBack', function() {
// 					var bgLayers = $('.bg-layers > .bg-layer');

// 					/*if(bgLayers.length > 1) {
// 						bgLayers.not(':hidden').fadeOut(1000, function() {
// 							$(this).remove();
// 						});
// 					}
// 					bgLayers.filter(':hidden').fadeIn(1000);*/
// 				});

// 				//$('.loading-bar').css('display', 'none');
// 			});

// 			$(window).on('statechange', function(ev) {
// 				//console.log(history.getState());
// 				newState = history.getState();

// 				loadPage(newState.url);
// 			});

// 			var timer = null;
// 			$(document).on('click', 'a', function(ev){
// 				//clearTimeout(timer);
// 				//ev.preventDefault();
// 				/*timer = setTimeout(function() {
// 					processLinkAction(ev);
// 				}, 200);*/

// 				$('#main').promise().done(function(){
// 					processLinkAction(ev);
// 				});
// 			});
// 		}
		
		
// 	});

// })(jQuery);

['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Array'].forEach( 
    function(name) { 
        jQuery['is' + name] = function(obj) {
              return Object.prototype.toString.call(obj) == '[object ' + name + ']';
    }; 
});


(function($) {
	//$(document).ready(function() {

		//console.log(History);

		//History events & Ajax
		if(window.History){
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
						if(console && console.log)
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
	//});

})(jQuery);
