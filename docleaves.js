'use strict';

if (typeof window.Promise != 'function') {
	alert('This requires a browser that supports ES6 Promises, e.g. Chrome 32');
}

var docleaves = {
	ready: function(){
		prettyPrint(); // convert the Markown first

		var nodes = document.querySelectorAll('script[type="text/eval+javascript"]');

		var queue = Array.prototype.slice.call(nodes);

		var run = function() {
			var node = queue.shift();
			var script = node.innerHTML.trim();
			var placeholder = node.getAttribute('placeholder');

			var figure = document.createElement('figure');
			node.parentNode.insertBefore(figure, node);
			node.parentNode.removeChild(node);

			var code = document.createElement('code');
			code.className = 'prettyprint lang-js';
			code.innerHTML = script;
			figure.appendChild(code);

			var samp = document.createElement('samp');
			samp.textContent = placeholder;
			figure.appendChild(samp);

			var error = function(message) {
				samp.className = 'error';
				done(message);
			};

			var done = function(output) {
				if (output instanceof Promise) {
					return output.then(done, error);
				} else if (output instanceof HTMLElement) {
					samp.appendChild(output);
				} else {
					samp.textContent = JSON.stringify(output, null, 2);
				}

				if (queue.length) {
					run();
				} //else {
					prettyPrint();
				//}
			};

			(function(script, node) {
				try {
					done(new Function(script)());
				} catch (e) {
					error(e.message);
				}
			})(code.textContent, samp);
		}

		run();
	}
};

