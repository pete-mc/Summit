// Desc: Helper functions for the project

// Function to get a random color
function getRandomColor() {
  return `rgba(${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},1)`;
}

//xpath jquery function
$.fn.xpath = function(expr) {
  var found = [];
  var context = this[0];
  var result = document.evaluate(expr, context, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
  var node;
  while (node = result.iterateNext()) {
      found.push(node);
  }
  return $(found);
};


// Function to throttle other functions
function throttle(func, limit) {
  let lastRan;
  let lastFunc;
  return function debounced() {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function() {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}