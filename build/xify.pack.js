(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.xify = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * urlInternal - v1.0 - 10/7/2009
 * http://benalman.com/projects/jquery-urlinternal-plugin/
 * 
 * Copyright (c) 2009 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

// Script: jQuery urlInternal: Easily test URL internal-, external or fragment-ness
// 
// *Version: 1.0, Last updated: 10/7/2009*
// 
// Project Home - http://benalman.com/projects/jquery-urlinternal-plugin/
// GitHub       - http://github.com/cowboy/jquery-urlinternal/
// Source       - http://github.com/cowboy/jquery-urlinternal/raw/master/jquery.ba-urlinternal.js
// (Minified)   - http://github.com/cowboy/jquery-urlinternal/raw/master/jquery.ba-urlinternal.min.js (1.7kb)
// 
// About: License
// 
// Copyright (c) 2009 "Cowboy" Ben Alman,
// Dual licensed under the MIT and GPL licenses.
// http://benalman.com/about/license/
// 
// About: Examples
// 
// This working example, complete with fully commented code, illustrates a few
// ways in which this plugin can be used.
// 
// http://benalman.com/code/projects/jquery-urlinternal/examples/urlinternal/
// 
// About: Support and Testing
// 
// Information about what version or versions of jQuery this plugin has been
// tested with, what browsers it has been tested in, and where the unit tests
// reside (so you can test it yourself).
// 
// jQuery Versions - 1.3.2
// Browsers Tested - Internet Explorer 6-8, Firefox 2-3.7, Safari 3-4, Chrome, Opera 9.6-10.
// Unit Tests      - http://benalman.com/code/projects/jquery-urlinternal/unit/
// 
// About: Release History
// 
// 1.0 - (10/7/2009) Initial release

(function($){
  '$:nomunge'; // Used by YUI compressor.
  
  // Some convenient shortcuts.
  var undefined,
    TRUE = !0,
    FALSE = !1,
    loc = window.location,
    aps = Array.prototype.slice,
    
    matches = loc.href.match( /^((https?:\/\/.*?\/)?[^#]*)#?.*$/ ),
    loc_fragbase = matches[1] + '#',
    loc_hostbase = matches[2],
    
    // Method references.
    jq_elemUrlAttr,
    jq_urlInternalHost,
    jq_urlInternalRegExp,
    jq_isUrlInternal,
    jq_isUrlExternal,
    jq_isUrlFragment,
    
    // Reused strings.
    str_elemUrlAttr = 'elemUrlAttr',
    str_href = 'href',
    str_src = 'src',
    str_urlInternal = 'urlInternal',
    str_urlExternal = 'urlExternal',
    str_urlFragment = 'urlFragment',
    
    url_regexp,
    
    // Used by jQuery.elemUrlAttr.
    elemUrlAttr_cache = {};
  
  // Why write the same function twice? Let's curry! Mmmm, curry..
  
  function curry( func ) {
    var args = aps.call( arguments, 1 );
    
    return function() {
      return func.apply( this, args.concat( aps.call( arguments ) ) );
    };
  };
  
  // Section: Methods
  // 
  // Method: jQuery.isUrlInternal
  // 
  // Test whether or not a URL is internal. Non-navigating URLs (ie. #anchor,
  // javascript:, mailto:, news:, tel:, im: or non-http/https protocol://
  // links) are not considered internal.
  // 
  // Usage:
  // 
  // > jQuery.isUrlInternal( url );
  // 
  // Arguments:
  // 
  //   url - (String) a URL to test the internal-ness of.
  // 
  // Returns:
  // 
  //  (Boolean) true if the URL is internal, false if external, or undefined if
  //  the URL is non-navigating.
  
  $.isUrlInternal = jq_isUrlInternal = function( url ) {
    
    // non-navigating: url is nonexistent or a fragment
    if ( !url || jq_isUrlFragment( url ) ) { return undefined; }
    
    // internal: url is absolute-but-internal (see $.urlInternalRegExp)
    if ( url_regexp.test(url) ) { return TRUE; }
    
    // external: url is absolute (begins with http:// or https:// or //)
    if ( /^(?:https?:)?\/\//i.test(url) ) { return FALSE; }
    
    // non-navigating: url begins with scheme:
    if ( /^[a-z\d.-]+:/i.test(url) ) { return undefined; }
    
    return TRUE;
  };
  
  // Method: jQuery.isUrlExternal
  // 
  // Test whether or not a URL is external. Non-navigating URLs (ie. #anchor,
  // mailto:, javascript:, or non-http/https protocol:// links) are not
  // considered external.
  // 
  // Usage:
  // 
  // > jQuery.isUrlExternal( url );
  // 
  // Arguments:
  // 
  //   url - (String) a URL to test the external-ness of.
  // 
  // Returns:
  // 
  //  (Boolean) true if the URL is external, false if internal, or undefined if
  //  the URL is non-navigating.
  
  $.isUrlExternal = jq_isUrlExternal = function( url ) {
    var result = jq_isUrlInternal( url );
    
    return typeof result === 'boolean'
      ? !result
      : result;
  };
  
  // Method: jQuery.isUrlFragment
  // 
  // Test whether or not a URL is a fragment in the context of the current page,
  // meaning the URL can either begin with # or be a partial URL or full URI,
  // but when it is navigated to, only the document.location.hash will change,
  // and the page will not reload.
  // 
  // Usage:
  // 
  // > jQuery.isUrlFragment( url );
  // 
  // Arguments:
  // 
  //   url - (String) a URL to test the fragment-ness of.
  // 
  // Returns:
  // 
  //  (Boolean) true if the URL is a fragment, false otherwise.
  
  $.isUrlFragment = jq_isUrlFragment = function( url ) {
    var matches = ( url || '' ).match( /^([^#]?)([^#]*#).*$/ );
    
    // url *might* be a fragment, since there were matches.
    return !!matches && (
      
      // url is just a fragment.
      matches[2] === '#'
      
      // url is absolute and contains a fragment, but is otherwise the same URI.
      || url.indexOf( loc_fragbase ) === 0
      
      // url is relative, begins with '/', contains a fragment, and is otherwise
      // the same URI.
      || ( matches[1] === '/' ? loc_hostbase + matches[2] === loc_fragbase
      
      // url is relative, but doesn't begin with '/', contains a fragment, and
      // is otherwise the same URI. This isn't even remotely efficient, but it's
      // significantly less code than parsing everything. Besides, it will only
      // even be tested on url values that contain '#', aren't absolute, and
      // don't begin with '/', which is not going to be many of them.
      : !/^https?:\/\//i.test( url ) && $('<a href="' + url + '"/>')[0].href.indexOf( loc_fragbase ) === 0 )
    );
  };
  
  // Method: jQuery.fn.urlInternal
  // 
  // Filter a jQuery collection of elements, returning only elements that have
  // an internal URL (as determined by <jQuery.isUrlInternal>). If URL cannot
  // be determined, remove the element from the collection.
  // 
  // Usage:
  // 
  // > jQuery('selector').urlInternal( [ attr ] );
  // 
  // Arguments:
  // 
  //  attr - (String) Optional name of an attribute that will contain a URL to
  //    test internal-ness against. See <jQuery.elemUrlAttr> for a list of
  //    default attributes.
  // 
  // Returns:
  // 
  //  (jQuery) A filtered jQuery collection of elements.
  
  // Method: jQuery.fn.urlExternal
  // 
  // Filter a jQuery collection of elements, returning only elements that have
  // an external URL (as determined by <jQuery.isUrlExternal>). If URL cannot
  // be determined, remove the element from the collection.
  // 
  // Usage:
  // 
  // > jQuery('selector').urlExternal( [ attr ] );
  // 
  // Arguments:
  // 
  //  attr - (String) Optional name of an attribute that will contain a URL to
  //    test external-ness against. See <jQuery.elemUrlAttr> for a list of
  //    default attributes.
  // 
  // Returns:
  // 
  //  (jQuery) A filtered jQuery collection of elements.
  
  // Method: jQuery.fn.urlFragment
  // 
  // Filter a jQuery collection of elements, returning only elements that have
  // an fragment URL (as determined by <jQuery.isUrlFragment>). If URL cannot
  // be determined, remove the element from the collection.
  // 
  // Note that in most browsers, selecting $("a[href^=#]") is reliable, but this
  // doesn't always work in IE6/7! In order to properly test whether a URL
  // attribute's value is a fragment in the context of the current page, you can
  // either make your selector a bit more complicated.. or use .urlFragment!
  // 
  // Usage:
  // 
  // > jQuery('selector').urlFragment( [ attr ] );
  // 
  // Arguments:
  // 
  //  attr - (String) Optional name of an attribute that will contain a URL to
  //    test external-ness against. See <jQuery.elemUrlAttr> for a list of
  //    default attributes.
  // 
  // Returns:
  // 
  //  (jQuery) A filtered jQuery collection of elements.
  
  function fn_filter( str, attr ) {
    return this.filter( ':' + str + (attr ? '(' + attr + ')' : '') );
  };
  
  $.fn[ str_urlInternal ] = curry( fn_filter, str_urlInternal );
  $.fn[ str_urlExternal ] = curry( fn_filter, str_urlExternal );
  $.fn[ str_urlFragment ] = curry( fn_filter, str_urlFragment );
  
  // Section: Selectors
  // 
  // Selector: :urlInternal
  // 
  // Filter a jQuery collection of elements, returning only elements that have
  // an internal URL (as determined by <jQuery.isUrlInternal>). If URL cannot
  // be determined, remove the element from the collection.
  // 
  // Usage:
  // 
  // > jQuery('selector').filter(':urlInternal');
  // > jQuery('selector').filter(':urlInternal(attr)');
  // 
  // Arguments:
  // 
  //  attr - (String) Optional name of an attribute that will contain a URL to
  //    test internal-ness against. See <jQuery.elemUrlAttr> for a list of
  //    default attributes.
  // 
  // Returns:
  // 
  //  (jQuery) A filtered jQuery collection of elements.
  
  // Selector: :urlExternal
  // 
  // Filter a jQuery collection of elements, returning only elements that have
  // an external URL (as determined by <jQuery.isUrlExternal>). If URL cannot
  // be determined, remove the element from the collection.
  // 
  // Usage:
  // 
  // > jQuery('selector').filter(':urlExternal');
  // > jQuery('selector').filter(':urlExternal(attr)');
  // 
  // Arguments:
  // 
  //  attr - (String) Optional name of an attribute that will contain a URL to
  //    test external-ness against. See <jQuery.elemUrlAttr> for a list of
  //    default attributes.
  // 
  // Returns:
  // 
  //  (jQuery) A filtered jQuery collection of elements.
  
  // Selector: :urlFragment
  // 
  // Filter a jQuery collection of elements, returning only elements that have
  // an fragment URL (as determined by <jQuery.isUrlFragment>). If URL cannot
  // be determined, remove the element from the collection.
  // 
  // Note that in most browsers, selecting $("a[href^=#]") is reliable, but this
  // doesn't always work in IE6/7! In order to properly test whether a URL
  // attribute's value is a fragment in the context of the current page, you can
  // either make your selector a bit more complicated.. or use :urlFragment!
  // 
  // Usage:
  // 
  // > jQuery('selector').filter(':urlFragment');
  // > jQuery('selector').filter(':urlFragment(attr)');
  // 
  // Arguments:
  // 
  //  attr - (String) Optional name of an attribute that will contain a URL to
  //    test fragment-ness against. See <jQuery.elemUrlAttr> for a list of
  //    default attributes.
  // 
  // Returns:
  // 
  //  (jQuery) A filtered jQuery collection of elements.
  
  function fn_selector( func, elem, i, match ) {
    var a = match[3] || jq_elemUrlAttr()[ ( elem.nodeName || '' ).toLowerCase() ] || '';
    
    return a ? !!func( elem.getAttribute( a ) ) : FALSE;
  };
  
  $.expr[':'][ str_urlInternal ] = curry( fn_selector, jq_isUrlInternal );
  $.expr[':'][ str_urlExternal ] = curry( fn_selector, jq_isUrlExternal );
  $.expr[':'][ str_urlFragment ] = curry( fn_selector, jq_isUrlFragment );
  
  // Section: Support methods
  // 
  // Method: jQuery.elemUrlAttr
  // 
  // Get the internal "Default URL attribute per tag" list, or augment the list
  // with additional tag-attribute pairs, in case the defaults are insufficient.
  // 
  // In the <jQuery.fn.urlInternal> and <jQuery.fn.urlExternal> methods, as well
  // as the <:urlInternal> and <:urlExternal> selectors, this list is used to
  // determine which attribute contains the URL to be modified, if an "attr"
  // param is not specified.
  // 
  // Default Tag-Attribute List:
  // 
  //  a      - href
  //  base   - href
  //  iframe - src
  //  img    - src
  //  input  - src
  //  form   - action
  //  link   - href
  //  script - src
  // 
  // Usage:
  // 
  // > jQuery.elemUrlAttr( [ tag_attr ] );
  // 
  // Arguments:
  // 
  //  tag_attr - (Object) An object containing a list of tag names and their
  //    associated default attribute names in the format { tag: 'attr', ... } to
  //    be merged into the internal tag-attribute list.
  // 
  // Returns:
  // 
  //  (Object) An object containing all stored tag-attribute values.
  
  // Only define function and set defaults if function doesn't already exist, as
  // the jQuery BBQ plugin will provide this method as well.
  $[ str_elemUrlAttr ] || ($[ str_elemUrlAttr ] = function( obj ) {
    return $.extend( elemUrlAttr_cache, obj );
  })({
    a: str_href,
    base: str_href,
    iframe: str_src,
    img: str_src,
    input: str_src,
    form: 'action',
    link: str_href,
    script: str_src
  });
  
  jq_elemUrlAttr = $[ str_elemUrlAttr ];
  
  // Method: jQuery.urlInternalHost
  // 
  // Constructs the regular expression that matches an absolute-but-internal
  // URL from the current page's protocol, hostname and port, allowing for any
  // number of optional hostnames. For example, if the current page is
  // http://benalman.com/test or http://www.benalman.com/test, specifying an
  // argument of "www" would yield this pattern:
  // 
  // > /^(?:http:)?\/\/(?:(?:www)\.)?benalman.com\//i
  // 
  // This pattern will match URLs beginning with both http://benalman.com/ and
  // http://www.benalman.com/. If the current page is http://benalman.com/test,
  // http://www.benalman.com/test or http://foo.benalman.com/test, specifying
  // arguments "www", "foo" would yield this pattern:
  // 
  // > /^(?:http:)?\/\/(?:(?:www|foo)\.)?benalman.com\//i
  // 
  // This pattern will match URLs beginning with http://benalman.com/,
  // http://www.benalman.com/ and http://foo.benalman.com/.
  // 
  // Not specifying any alt_hostname will disable any alt-hostname matching.
  // 
  // Note that the plugin is initialized by default to an alt_hostname of "www".
  // Should you need more control, <jQuery.urlInternalRegExp> may be used to
  // completely customize the absolute-but-internal matching pattern.
  // 
  // Usage:
  // 
  // > jQuery.urlInternalHost( [ alt_hostname [, alt_hostname ] ... ] );
  // 
  // Arguments:
  // 
  //  alt_hostname - (String) An optional alternate hostname to use when testing
  //    URL absolute-but-internal-ness. 
  // 
  // Returns:
  // 
  //  (RegExp) The absolute-but-internal pattern, as a RegExp.
  
  $.urlInternalHost = jq_urlInternalHost = function( alt_hostname ) {
    alt_hostname = alt_hostname
      ? '(?:(?:' + Array.prototype.join.call( arguments, '|' ) + ')\\.)?'
      : '';
    
    var re = new RegExp( '^' + alt_hostname + '(.*)', 'i' ),
      pattern = '^(?:' + loc.protocol + ')?//'
        + loc.hostname.replace(re, alt_hostname + '$1').replace( /\\?\./g, '\\.' )
        + (loc.port ? ':' + loc.port : '') + '/';
    
    return jq_urlInternalRegExp( pattern );
  };
    
  // Method: jQuery.urlInternalRegExp
  // 
  // Set or get the regular expression that matches an absolute-but-internal
  // URL.
  // 
  // Usage:
  // 
  // > jQuery.urlInternalRegExp( [ re ] );
  // 
  // Arguments:
  // 
  //  re - (String or RegExp) The regular expression pattern. If not passed,
  //    nothing is changed.
  // 
  // Returns:
  // 
  //  (RegExp) The absolute-but-internal pattern, as a RegExp.
  
  $.urlInternalRegExp = jq_urlInternalRegExp = function( re ) {
    if ( re ) {
      url_regexp = typeof re === 'string'
        ? new RegExp( re, 'i' )
        : re;
    }
    
    return url_regexp;
  };
  
  // Initialize url_regexp with a reasonable default.
  jq_urlInternalHost( 'www' );
  
})(jQuery);

},{}],2:[function(require,module,exports){
typeof JSON!="object"&&(JSON={}),function(){"use strict";function f(e){return e<10?"0"+e:e}function quote(e){return escapable.lastIndex=0,escapable.test(e)?'"'+e.replace(escapable,function(e){var t=meta[e];return typeof t=="string"?t:"\\u"+("0000"+e.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+e+'"'}function str(e,t){var n,r,i,s,o=gap,u,a=t[e];a&&typeof a=="object"&&typeof a.toJSON=="function"&&(a=a.toJSON(e)),typeof rep=="function"&&(a=rep.call(t,e,a));switch(typeof a){case"string":return quote(a);case"number":return isFinite(a)?String(a):"null";case"boolean":case"null":return String(a);case"object":if(!a)return"null";gap+=indent,u=[];if(Object.prototype.toString.apply(a)==="[object Array]"){s=a.length;for(n=0;n<s;n+=1)u[n]=str(n,a)||"null";return i=u.length===0?"[]":gap?"[\n"+gap+u.join(",\n"+gap)+"\n"+o+"]":"["+u.join(",")+"]",gap=o,i}if(rep&&typeof rep=="object"){s=rep.length;for(n=0;n<s;n+=1)typeof rep[n]=="string"&&(r=rep[n],i=str(r,a),i&&u.push(quote(r)+(gap?": ":":")+i))}else for(r in a)Object.prototype.hasOwnProperty.call(a,r)&&(i=str(r,a),i&&u.push(quote(r)+(gap?": ":":")+i));return i=u.length===0?"{}":gap?"{\n"+gap+u.join(",\n"+gap)+"\n"+o+"}":"{"+u.join(",")+"}",gap=o,i}}typeof Date.prototype.toJSON!="function"&&(Date.prototype.toJSON=function(e){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null},String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(e){return this.valueOf()});var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","	":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;typeof JSON.stringify!="function"&&(JSON.stringify=function(e,t,n){var r;gap="",indent="";if(typeof n=="number")for(r=0;r<n;r+=1)indent+=" ";else typeof n=="string"&&(indent=n);rep=t;if(!t||typeof t=="function"||typeof t=="object"&&typeof t.length=="number")return str("",{"":e});throw new Error("JSON.stringify")}),typeof JSON.parse!="function"&&(JSON.parse=function(text,reviver){function walk(e,t){var n,r,i=e[t];if(i&&typeof i=="object")for(n in i)Object.prototype.hasOwnProperty.call(i,n)&&(r=walk(i,n),r!==undefined?i[n]=r:delete i[n]);return reviver.call(e,t,i)}var j;text=String(text),cx.lastIndex=0,cx.test(text)&&(text=text.replace(cx,function(e){return"\\u"+("0000"+e.charCodeAt(0).toString(16)).slice(-4)}));if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,"")))return j=eval("("+text+")"),typeof reviver=="function"?walk({"":j},""):j;throw new SyntaxError("JSON.parse")})}(),function(e,t){"use strict";var n=e.History=e.History||{},r=e.jQuery;if(typeof n.Adapter!="undefined")throw new Error("History.js Adapter has already been loaded...");n.Adapter={bind:function(e,t,n){r(e).bind(t,n)},trigger:function(e,t,n){r(e).trigger(t,n)},extractEventData:function(e,n,r){var i=n&&n.originalEvent&&n.originalEvent[e]||r&&r[e]||t;return i},onDomLoad:function(e){r(e)}},typeof n.init!="undefined"&&n.init()}(window),function(e,t){"use strict";var n=e.document,r=e.setTimeout||r,i=e.clearTimeout||i,s=e.setInterval||s,o=e.History=e.History||{};if(typeof o.initHtml4!="undefined")throw new Error("History.js HTML4 Support has already been loaded...");o.initHtml4=function(){if(typeof o.initHtml4.initialized!="undefined")return!1;o.initHtml4.initialized=!0,o.enabled=!0,o.savedHashes=[],o.isLastHash=function(e){var t=o.getHashByIndex(),n;return n=e===t,n},o.isHashEqual=function(e,t){return e=encodeURIComponent(e).replace(/%25/g,"%"),t=encodeURIComponent(t).replace(/%25/g,"%"),e===t},o.saveHash=function(e){return o.isLastHash(e)?!1:(o.savedHashes.push(e),!0)},o.getHashByIndex=function(e){var t=null;return typeof e=="undefined"?t=o.savedHashes[o.savedHashes.length-1]:e<0?t=o.savedHashes[o.savedHashes.length+e]:t=o.savedHashes[e],t},o.discardedHashes={},o.discardedStates={},o.discardState=function(e,t,n){var r=o.getHashByState(e),i;return i={discardedState:e,backState:n,forwardState:t},o.discardedStates[r]=i,!0},o.discardHash=function(e,t,n){var r={discardedHash:e,backState:n,forwardState:t};return o.discardedHashes[e]=r,!0},o.discardedState=function(e){var t=o.getHashByState(e),n;return n=o.discardedStates[t]||!1,n},o.discardedHash=function(e){var t=o.discardedHashes[e]||!1;return t},o.recycleState=function(e){var t=o.getHashByState(e);return o.discardedState(e)&&delete o.discardedStates[t],!0},o.emulated.hashChange&&(o.hashChangeInit=function(){o.checkerFunction=null;var t="",r,i,u,a,f=Boolean(o.getHash());return o.isInternetExplorer()?(r="historyjs-iframe",i=n.createElement("iframe"),i.setAttribute("id",r),i.setAttribute("src","#"),i.style.display="none",n.body.appendChild(i),i.contentWindow.document.open(),i.contentWindow.document.close(),u="",a=!1,o.checkerFunction=function(){if(a)return!1;a=!0;var n=o.getHash(),r=o.getHash(i.contentWindow.document);return n!==t?(t=n,r!==n&&(u=r=n,i.contentWindow.document.open(),i.contentWindow.document.close(),i.contentWindow.document.location.hash=o.escapeHash(n)),o.Adapter.trigger(e,"hashchange")):r!==u&&(u=r,f&&r===""?o.back():o.setHash(r,!1)),a=!1,!0}):o.checkerFunction=function(){var n=o.getHash()||"";return n!==t&&(t=n,o.Adapter.trigger(e,"hashchange")),!0},o.intervalList.push(s(o.checkerFunction,o.options.hashChangeInterval)),!0},o.Adapter.onDomLoad(o.hashChangeInit)),o.emulated.pushState&&(o.onHashChange=function(t){var n=t&&t.newURL||o.getLocationHref(),r=o.getHashByUrl(n),i=null,s=null,u=null,a;return o.isLastHash(r)?(o.busy(!1),!1):(o.doubleCheckComplete(),o.saveHash(r),r&&o.isTraditionalAnchor(r)?(o.Adapter.trigger(e,"anchorchange"),o.busy(!1),!1):(i=o.extractState(o.getFullUrl(r||o.getLocationHref()),!0),o.isLastSavedState(i)?(o.busy(!1),!1):(s=o.getHashByState(i),a=o.discardedState(i),a?(o.getHashByIndex(-2)===o.getHashByState(a.forwardState)?o.back(!1):o.forward(!1),!1):(o.pushState(i.data,i.title,encodeURI(i.url),!1),!0))))},o.Adapter.bind(e,"hashchange",o.onHashChange),o.pushState=function(t,n,r,i){r=encodeURI(r).replace(/%25/g,"%");if(o.getHashByUrl(r))throw new Error("History.js does not support states with fragment-identifiers (hashes/anchors).");if(i!==!1&&o.busy())return o.pushQueue({scope:o,callback:o.pushState,args:arguments,queue:i}),!1;o.busy(!0);var s=o.createStateObject(t,n,r),u=o.getHashByState(s),a=o.getState(!1),f=o.getHashByState(a),l=o.getHash(),c=o.expectedStateId==s.id;return o.storeState(s),o.expectedStateId=s.id,o.recycleState(s),o.setTitle(s),u===f?(o.busy(!1),!1):(o.saveState(s),c||o.Adapter.trigger(e,"statechange"),!o.isHashEqual(u,l)&&!o.isHashEqual(u,o.getShortUrl(o.getLocationHref()))&&o.setHash(u,!1),o.busy(!1),!0)},o.replaceState=function(t,n,r,i){r=encodeURI(r).replace(/%25/g,"%");if(o.getHashByUrl(r))throw new Error("History.js does not support states with fragment-identifiers (hashes/anchors).");if(i!==!1&&o.busy())return o.pushQueue({scope:o,callback:o.replaceState,args:arguments,queue:i}),!1;o.busy(!0);var s=o.createStateObject(t,n,r),u=o.getHashByState(s),a=o.getState(!1),f=o.getHashByState(a),l=o.getStateByIndex(-2);return o.discardState(a,s,l),u===f?(o.storeState(s),o.expectedStateId=s.id,o.recycleState(s),o.setTitle(s),o.saveState(s),o.Adapter.trigger(e,"statechange"),o.busy(!1)):o.pushState(s.data,s.title,s.url,!1),!0}),o.emulated.pushState&&o.getHash()&&!o.emulated.hashChange&&o.Adapter.onDomLoad(function(){o.Adapter.trigger(e,"hashchange")})},typeof o.init!="undefined"&&o.init()}(window),function(e,t){"use strict";var n=e.console||t,r=e.document,i=e.navigator,s=!1,o=e.setTimeout,u=e.clearTimeout,a=e.setInterval,f=e.clearInterval,l=e.JSON,c=e.alert,h=e.History=e.History||{},p=e.history;try{s=e.sessionStorage,s.setItem("TEST","1"),s.removeItem("TEST")}catch(d){s=!1}l.stringify=l.stringify||l.encode,l.parse=l.parse||l.decode;if(typeof h.init!="undefined")throw new Error("History.js Core has already been loaded...");h.init=function(e){return typeof h.Adapter=="undefined"?!1:(typeof h.initCore!="undefined"&&h.initCore(),typeof h.initHtml4!="undefined"&&h.initHtml4(),!0)},h.initCore=function(d){if(typeof h.initCore.initialized!="undefined")return!1;h.initCore.initialized=!0,h.options=h.options||{},h.options.hashChangeInterval=h.options.hashChangeInterval||100,h.options.safariPollInterval=h.options.safariPollInterval||500,h.options.doubleCheckInterval=h.options.doubleCheckInterval||500,h.options.disableSuid=h.options.disableSuid||!1,h.options.storeInterval=h.options.storeInterval||1e3,h.options.busyDelay=h.options.busyDelay||250,h.options.debug=h.options.debug||!1,h.options.initialTitle=h.options.initialTitle||r.title,h.options.html4Mode=h.options.html4Mode||!1,h.options.delayInit=h.options.delayInit||!1,h.intervalList=[],h.clearAllIntervals=function(){var e,t=h.intervalList;if(typeof t!="undefined"&&t!==null){for(e=0;e<t.length;e++)f(t[e]);h.intervalList=null}},h.debug=function(){(h.options.debug||!1)&&h.log.apply(h,arguments)},h.log=function(){var e=typeof n!="undefined"&&typeof n.log!="undefined"&&typeof n.log.apply!="undefined",t=r.getElementById("log"),i,s,o,u,a;e?(u=Array.prototype.slice.call(arguments),i=u.shift(),typeof n.debug!="undefined"?n.debug.apply(n,[i,u]):n.log.apply(n,[i,u])):i="\n"+arguments[0]+"\n";for(s=1,o=arguments.length;s<o;++s){a=arguments[s];if(typeof a=="object"&&typeof l!="undefined")try{a=l.stringify(a)}catch(f){}i+="\n"+a+"\n"}return t?(t.value+=i+"\n-----\n",t.scrollTop=t.scrollHeight-t.clientHeight):e||c(i),!0},h.getInternetExplorerMajorVersion=function(){var e=h.getInternetExplorerMajorVersion.cached=typeof h.getInternetExplorerMajorVersion.cached!="undefined"?h.getInternetExplorerMajorVersion.cached:function(){var e=3,t=r.createElement("div"),n=t.getElementsByTagName("i");while((t.innerHTML="<!--[if gt IE "+ ++e+"]><i></i><![endif]-->")&&n[0]);return e>4?e:!1}();return e},h.isInternetExplorer=function(){var e=h.isInternetExplorer.cached=typeof h.isInternetExplorer.cached!="undefined"?h.isInternetExplorer.cached:Boolean(h.getInternetExplorerMajorVersion());return e},h.options.html4Mode?h.emulated={pushState:!0,hashChange:!0}:h.emulated={pushState:!Boolean(e.history&&e.history.pushState&&e.history.replaceState&&!/ Mobile\/([1-7][a-z]|(8([abcde]|f(1[0-8]))))/i.test(i.userAgent)&&!/AppleWebKit\/5([0-2]|3[0-2])/i.test(i.userAgent)),hashChange:Boolean(!("onhashchange"in e||"onhashchange"in r)||h.isInternetExplorer()&&h.getInternetExplorerMajorVersion()<8)},h.enabled=!h.emulated.pushState,h.bugs={setHash:Boolean(!h.emulated.pushState&&i.vendor==="Apple Computer, Inc."&&/AppleWebKit\/5([0-2]|3[0-3])/.test(i.userAgent)),safariPoll:Boolean(!h.emulated.pushState&&i.vendor==="Apple Computer, Inc."&&/AppleWebKit\/5([0-2]|3[0-3])/.test(i.userAgent)),ieDoubleCheck:Boolean(h.isInternetExplorer()&&h.getInternetExplorerMajorVersion()<8),hashEscape:Boolean(h.isInternetExplorer()&&h.getInternetExplorerMajorVersion()<7)},h.isEmptyObject=function(e){for(var t in e)if(e.hasOwnProperty(t))return!1;return!0},h.cloneObject=function(e){var t,n;return e?(t=l.stringify(e),n=l.parse(t)):n={},n},h.getRootUrl=function(){var e=r.location.protocol+"//"+(r.location.hostname||r.location.host);if(r.location.port||!1)e+=":"+r.location.port;return e+="/",e},h.getBaseHref=function(){var e=r.getElementsByTagName("base"),t=null,n="";return e.length===1&&(t=e[0],n=t.href.replace(/[^\/]+$/,"")),n=n.replace(/\/+$/,""),n&&(n+="/"),n},h.getBaseUrl=function(){var e=h.getBaseHref()||h.getBasePageUrl()||h.getRootUrl();return e},h.getPageUrl=function(){var e=h.getState(!1,!1),t=(e||{}).url||h.getLocationHref(),n;return n=t.replace(/\/+$/,"").replace(/[^\/]+$/,function(e,t,n){return/\./.test(e)?e:e+"/"}),n},h.getBasePageUrl=function(){var e=h.getLocationHref().replace(/[#\?].*/,"").replace(/[^\/]+$/,function(e,t,n){return/[^\/]$/.test(e)?"":e}).replace(/\/+$/,"")+"/";return e},h.getFullUrl=function(e,t){var n=e,r=e.substring(0,1);return t=typeof t=="undefined"?!0:t,/[a-z]+\:\/\//.test(e)||(r==="/"?n=h.getRootUrl()+e.replace(/^\/+/,""):r==="#"?n=h.getPageUrl().replace(/#.*/,"")+e:r==="?"?n=h.getPageUrl().replace(/[\?#].*/,"")+e:t?n=h.getBaseUrl()+e.replace(/^(\.\/)+/,""):n=h.getBasePageUrl()+e.replace(/^(\.\/)+/,"")),n.replace(/\#$/,"")},h.getShortUrl=function(e){var t=e,n=h.getBaseUrl(),r=h.getRootUrl();return h.emulated.pushState&&(t=t.replace(n,"")),t=t.replace(r,"/"),h.isTraditionalAnchor(t)&&(t="./"+t),t=t.replace(/^(\.\/)+/g,"./").replace(/\#$/,""),t},h.getLocationHref=function(e){return e=e||r,e.URL===e.location.href?e.location.href:e.location.href===decodeURIComponent(e.URL)?e.URL:e.location.hash&&decodeURIComponent(e.location.href.replace(/^[^#]+/,""))===e.location.hash?e.location.href:e.URL.indexOf("#")==-1&&e.location.href.indexOf("#")!=-1?e.location.href:e.URL||e.location.href},h.store={},h.idToState=h.idToState||{},h.stateToId=h.stateToId||{},h.urlToId=h.urlToId||{},h.storedStates=h.storedStates||[],h.savedStates=h.savedStates||[],h.normalizeStore=function(){h.store.idToState=h.store.idToState||{},h.store.urlToId=h.store.urlToId||{},h.store.stateToId=h.store.stateToId||{}},h.getState=function(e,t){typeof e=="undefined"&&(e=!0),typeof t=="undefined"&&(t=!0);var n=h.getLastSavedState();return!n&&t&&(n=h.createStateObject()),e&&(n=h.cloneObject(n),n.url=n.cleanUrl||n.url),n},h.getIdByState=function(e){var t=h.extractId(e.url),n;if(!t){n=h.getStateString(e);if(typeof h.stateToId[n]!="undefined")t=h.stateToId[n];else if(typeof h.store.stateToId[n]!="undefined")t=h.store.stateToId[n];else{for(;;){t=(new Date).getTime()+String(Math.random()).replace(/\D/g,"");if(typeof h.idToState[t]=="undefined"&&typeof h.store.idToState[t]=="undefined")break}h.stateToId[n]=t,h.idToState[t]=e}}return t},h.normalizeState=function(e){var t,n;if(!e||typeof e!="object")e={};if(typeof e.normalized!="undefined")return e;if(!e.data||typeof e.data!="object")e.data={};return t={},t.normalized=!0,t.title=e.title||"",t.url=h.getFullUrl(e.url?e.url:h.getLocationHref()),t.hash=h.getShortUrl(t.url),t.data=h.cloneObject(e.data),t.id=h.getIdByState(t),t.cleanUrl=t.url.replace(/\??\&_suid.*/,""),t.url=t.cleanUrl,n=!h.isEmptyObject(t.data),(t.title||n)&&h.options.disableSuid!==!0&&(t.hash=h.getShortUrl(t.url).replace(/\??\&_suid.*/,""),/\?/.test(t.hash)||(t.hash+="?"),t.hash+="&_suid="+t.id),t.hashedUrl=h.getFullUrl(t.hash),(h.emulated.pushState||h.bugs.safariPoll)&&h.hasUrlDuplicate(t)&&(t.url=t.hashedUrl),t},h.createStateObject=function(e,t,n){var r={data:e,title:t,url:n};return r=h.normalizeState(r),r},h.getStateById=function(e){e=String(e);var n=h.idToState[e]||h.store.idToState[e]||t;return n},h.getStateString=function(e){var t,n,r;return t=h.normalizeState(e),n={data:t.data,title:e.title,url:e.url},r=l.stringify(n),r},h.getStateId=function(e){var t,n;return t=h.normalizeState(e),n=t.id,n},h.getHashByState=function(e){var t,n;return t=h.normalizeState(e),n=t.hash,n},h.extractId=function(e){var t,n,r,i;return e.indexOf("#")!=-1?i=e.split("#")[0]:i=e,n=/(.*)\&_suid=([0-9]+)$/.exec(i),r=n?n[1]||e:e,t=n?String(n[2]||""):"",t||!1},h.isTraditionalAnchor=function(e){var t=!/[\/\?\.]/.test(e);return t},h.extractState=function(e,t){var n=null,r,i;return t=t||!1,r=h.extractId(e),r&&(n=h.getStateById(r)),n||(i=h.getFullUrl(e),r=h.getIdByUrl(i)||!1,r&&(n=h.getStateById(r)),!n&&t&&!h.isTraditionalAnchor(e)&&(n=h.createStateObject(null,null,i))),n},h.getIdByUrl=function(e){var n=h.urlToId[e]||h.store.urlToId[e]||t;return n},h.getLastSavedState=function(){return h.savedStates[h.savedStates.length-1]||t},h.getLastStoredState=function(){return h.storedStates[h.storedStates.length-1]||t},h.hasUrlDuplicate=function(e){var t=!1,n;return n=h.extractState(e.url),t=n&&n.id!==e.id,t},h.storeState=function(e){return h.urlToId[e.url]=e.id,h.storedStates.push(h.cloneObject(e)),e},h.isLastSavedState=function(e){var t=!1,n,r,i;return h.savedStates.length&&(n=e.id,r=h.getLastSavedState(),i=r.id,t=n===i),t},h.saveState=function(e){return h.isLastSavedState(e)?!1:(h.savedStates.push(h.cloneObject(e)),!0)},h.getStateByIndex=function(e){var t=null;return typeof e=="undefined"?t=h.savedStates[h.savedStates.length-1]:e<0?t=h.savedStates[h.savedStates.length+e]:t=h.savedStates[e],t},h.getCurrentIndex=function(){var e=null;return h.savedStates.length<1?e=0:e=h.savedStates.length-1,e},h.getHash=function(e){var t=h.getLocationHref(e),n;return n=h.getHashByUrl(t),n},h.unescapeHash=function(e){var t=h.normalizeHash(e);return t=decodeURIComponent(t),t},h.normalizeHash=function(e){var t=e.replace(/[^#]*#/,"").replace(/#.*/,"");return t},h.setHash=function(e,t){var n,i;return t!==!1&&h.busy()?(h.pushQueue({scope:h,callback:h.setHash,args:arguments,queue:t}),!1):(h.busy(!0),n=h.extractState(e,!0),n&&!h.emulated.pushState?h.pushState(n.data,n.title,n.url,!1):h.getHash()!==e&&(h.bugs.setHash?(i=h.getPageUrl(),h.pushState(null,null,i+"#"+e,!1)):r.location.hash=e),h)},h.escapeHash=function(t){var n=h.normalizeHash(t);return n=e.encodeURIComponent(n),h.bugs.hashEscape||(n=n.replace(/\%21/g,"!").replace(/\%26/g,"&").replace(/\%3D/g,"=").replace(/\%3F/g,"?")),n},h.getHashByUrl=function(e){var t=String(e).replace(/([^#]*)#?([^#]*)#?(.*)/,"$2");return t=h.unescapeHash(t),t},h.setTitle=function(e){var t=e.title,n;t||(n=h.getStateByIndex(0),n&&n.url===e.url&&(t=n.title||h.options.initialTitle));try{r.getElementsByTagName("title")[0].innerHTML=t.replace("<","&lt;").replace(">","&gt;").replace(" & "," &amp; ")}catch(i){}return r.title=t,h},h.queues=[],h.busy=function(e){typeof e!="undefined"?h.busy.flag=e:typeof h.busy.flag=="undefined"&&(h.busy.flag=!1);if(!h.busy.flag){u(h.busy.timeout);var t=function(){var e,n,r;if(h.busy.flag)return;for(e=h.queues.length-1;e>=0;--e){n=h.queues[e];if(n.length===0)continue;r=n.shift(),h.fireQueueItem(r),h.busy.timeout=o(t,h.options.busyDelay)}};h.busy.timeout=o(t,h.options.busyDelay)}return h.busy.flag},h.busy.flag=!1,h.fireQueueItem=function(e){return e.callback.apply(e.scope||h,e.args||[])},h.pushQueue=function(e){return h.queues[e.queue||0]=h.queues[e.queue||0]||[],h.queues[e.queue||0].push(e),h},h.queue=function(e,t){return typeof e=="function"&&(e={callback:e}),typeof t!="undefined"&&(e.queue=t),h.busy()?h.pushQueue(e):h.fireQueueItem(e),h},h.clearQueue=function(){return h.busy.flag=!1,h.queues=[],h},h.stateChanged=!1,h.doubleChecker=!1,h.doubleCheckComplete=function(){return h.stateChanged=!0,h.doubleCheckClear(),h},h.doubleCheckClear=function(){return h.doubleChecker&&(u(h.doubleChecker),h.doubleChecker=!1),h},h.doubleCheck=function(e){return h.stateChanged=!1,h.doubleCheckClear(),h.bugs.ieDoubleCheck&&(h.doubleChecker=o(function(){return h.doubleCheckClear(),h.stateChanged||e(),!0},h.options.doubleCheckInterval)),h},h.safariStatePoll=function(){var t=h.extractState(h.getLocationHref()),n;if(!h.isLastSavedState(t))return n=t,n||(n=h.createStateObject()),h.Adapter.trigger(e,"popstate"),h;return},h.back=function(e){return e!==!1&&h.busy()?(h.pushQueue({scope:h,callback:h.back,args:arguments,queue:e}),!1):(h.busy(!0),h.doubleCheck(function(){h.back(!1)}),p.go(-1),!0)},h.forward=function(e){return e!==!1&&h.busy()?(h.pushQueue({scope:h,callback:h.forward,args:arguments,queue:e}),!1):(h.busy(!0),h.doubleCheck(function(){h.forward(!1)}),p.go(1),!0)},h.go=function(e,t){var n;if(e>0)for(n=1;n<=e;++n)h.forward(t);else{if(!(e<0))throw new Error("History.go: History.go requires a positive or negative integer passed.");for(n=-1;n>=e;--n)h.back(t)}return h};if(h.emulated.pushState){var v=function(){};h.pushState=h.pushState||v,h.replaceState=h.replaceState||v}else h.onPopState=function(t,n){var r=!1,i=!1,s,o;return h.doubleCheckComplete(),s=h.getHash(),s?(o=h.extractState(s||h.getLocationHref(),!0),o?h.replaceState(o.data,o.title,o.url,!1):(h.Adapter.trigger(e,"anchorchange"),h.busy(!1)),h.expectedStateId=!1,!1):(r=h.Adapter.extractEventData("state",t,n)||!1,r?i=h.getStateById(r):h.expectedStateId?i=h.getStateById(h.expectedStateId):i=h.extractState(h.getLocationHref()),i||(i=h.createStateObject(null,null,h.getLocationHref())),h.expectedStateId=!1,h.isLastSavedState(i)?(h.busy(!1),!1):(h.storeState(i),h.saveState(i),h.setTitle(i),h.Adapter.trigger(e,"statechange"),h.busy(!1),!0))},h.Adapter.bind(e,"popstate",h.onPopState),h.pushState=function(t,n,r,i){if(h.getHashByUrl(r)&&h.emulated.pushState)throw new Error("History.js does not support states with fragement-identifiers (hashes/anchors).");if(i!==!1&&h.busy())return h.pushQueue({scope:h,callback:h.pushState,args:arguments,queue:i}),!1;h.busy(!0);var s=h.createStateObject(t,n,r);return h.isLastSavedState(s)?h.busy(!1):(h.storeState(s),h.expectedStateId=s.id,p.pushState(s.id,s.title,s.url),h.Adapter.trigger(e,"popstate")),!0},h.replaceState=function(t,n,r,i){if(h.getHashByUrl(r)&&h.emulated.pushState)throw new Error("History.js does not support states with fragement-identifiers (hashes/anchors).");if(i!==!1&&h.busy())return h.pushQueue({scope:h,callback:h.replaceState,args:arguments,queue:i}),!1;h.busy(!0);var s=h.createStateObject(t,n,r);return h.isLastSavedState(s)?h.busy(!1):(h.storeState(s),h.expectedStateId=s.id,p.replaceState(s.id,s.title,s.url),h.Adapter.trigger(e,"popstate")),!0};if(s){try{h.store=l.parse(s.getItem("History.store"))||{}}catch(m){h.store={}}h.normalizeStore()}else h.store={},h.normalizeStore();h.Adapter.bind(e,"unload",h.clearAllIntervals),h.saveState(h.storeState(h.extractState(h.getLocationHref(),!0))),s&&(h.onUnload=function(){var e,t,n;try{e=l.parse(s.getItem("History.store"))||{}}catch(r){e={}}e.idToState=e.idToState||{},e.urlToId=e.urlToId||{},e.stateToId=e.stateToId||{};for(t in h.idToState){if(!h.idToState.hasOwnProperty(t))continue;e.idToState[t]=h.idToState[t]}for(t in h.urlToId){if(!h.urlToId.hasOwnProperty(t))continue;e.urlToId[t]=h.urlToId[t]}for(t in h.stateToId){if(!h.stateToId.hasOwnProperty(t))continue;e.stateToId[t]=h.stateToId[t]}h.store=e,h.normalizeStore(),n=l.stringify(e);try{s.setItem("History.store",n)}catch(i){if(i.code!==DOMException.QUOTA_EXCEEDED_ERR)throw i;s.length&&(s.removeItem("History.store"),s.setItem("History.store",n))}},h.intervalList.push(a(h.onUnload,h.options.storeInterval)),h.Adapter.bind(e,"beforeunload",h.onUnload),h.Adapter.bind(e,"unload",h.onUnload));if(!h.emulated.pushState){h.bugs.safariPoll&&h.intervalList.push(a(h.safariStatePoll,h.options.safariPollInterval));if(i.vendor==="Apple Computer, Inc."||(i.appCodeName||"")==="Mozilla")h.Adapter.bind(e,"hashchange",function(){h.Adapter.trigger(e,"popstate")}),h.getHash()&&h.Adapter.onDomLoad(function(){h.Adapter.trigger(e,"hashchange")})}},(!h.options||!h.options.delayInit)&&h.init()}(window)
},{}],3:[function(require,module,exports){
if(!window.jQuery) {
	window.jQuery = require('jquery');
}
// var jQuery = require('jquery');
var history = require('history');
var urlInternal = require('urlinternal');


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
		// window.xify = $;
		var history = window.History;
		$.xify = {};
		//$.xify.options.html4Mode = true;

		//Create an initial Deffered, pretending to be an XHR object, already resolved, to kick things off.
		//The xhr object is global to this plugin so that we can limit requests to one at a time.
		var xhr = $.Deferred().resolve(null);

		// Auotmatically replace title and meta elements.
		var autoReplace = function($html) {
			$html.find('title').replaceAll('title');
			$('meta').remove();
			$('head').prepend($html.find('meta'));
		}

		// Parse the text returned by xify as html.
		var parseHtml = function(text) {
			// Rename unparsable tag types.
			var html = String(text)
				.replace(/<\!DOCTYPE[^>]*>/i, '')
				.replace(/<(html|head|body|script)([\s\>])/gi,'<div data-xify="$1"$2')
				.replace(/<\/(html|head|body|script)\>/gi,'</div>')
				.trim();

			// Parse html string into DOM elements.
			var $html = $(html);
			autoReplace($html);

			return $html;
		}

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
						console.log('xify error:', status + ' ' + error);
				}

				act.success = function(data, status, xhr) {
					if(!act.elementMap)
						return;

					//TODO: Make the elementMap replacement much more powerful, 
					//enabling lists of elements to replace each other, appends, prepends, inserts at etc.

					var $html = parseHtml(data);
					// var $html = $('<div>').append($.parseHTML(data));
					//for(var key in act.elementMap) {
					$.each(act.elementMap, function(key, val) {
						//var val = act.elementMap[key];
						var $target = $(val.to || val.from);
						// If the target is the 'body' element only allow attribute replacement.
						// TODO: Perhaps add some logic to replace the innerHTML of the target if it is 'body'
						// and not attr.
						if($target.is('body') && val.attr) {
							val.from = '[data-xify="body"]';
						}
						var $replacement = $html.find(val.from); //.css('display', 'none');
						var replacingEvent = $.Event('replacing.xify', {elementMap: val, original: $target, replacement: $replacement[0]});
						var replacedEvent = $.Event('replaced.xify', {elementMap: val, original: $target, replacement: $replacement[0]});


						$target.trigger(replacingEvent);
						$target.promise().done(function() {
							if($.isArray(val.attr) && val.attr.length > 0) {
								$target.attr(val.attr[0], $replacement.attr(val.attr[1] || val.attr[0]) || '');
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

},{"history":2,"jquery":"jquery","urlinternal":1}]},{},[3])(3)
});


//# sourceMappingURL=xify.pack.js.map
