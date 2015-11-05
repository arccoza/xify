var $ = require('xify');

//Here we use xify to replace content on the page async.
//elementMap maps elements 'from' the new html 'to' the current DOM.
$.xify.on('click', 'a:urlInternal:not([href*="wp-"])', function(ev) {
  return {type: 'GET', url: $(ev.currentTarget).attr('href'), data: null, 
    elementMap: [{from: '#test-box1'}, {from: '.test-box2'}, {from: '.test-box3'}, {from: '#test-box4'}, {from: 'body', attr: ['class']}]};
});

var delay = 0;
//Handle xify DOM replace events.
$(document).on('replacing.xify replaced.xify', '#test-box1, .test-box2, .test-box3, #test-box4', function(ev) {
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
