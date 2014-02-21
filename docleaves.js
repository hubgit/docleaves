'use strict';

var docleaves = {
	ready: function(){
		var nodes = document.querySelectorAll('script[type="text/eval+javascript"]');

		Array.prototype.forEach.call(nodes, function(node) {
			var script = node.innerHTML.trim();

			var figure = document.createElement('figure');
			node.parentNode.insertBefore(figure, node);
			node.parentNode.removeChild(node);

			var code = document.createElement('code');
			code.className = 'prettyprint lang-js';
			code.innerHTML = script;
			figure.appendChild(code);

			var samp = document.createElement('samp');
			figure.appendChild(samp);

			(function(script, node) {
				try {
					var output = new Function(script)();

					if (output instanceof HTMLElement) {
						samp.appendChild(output);
					} else {
						samp.textContent = JSON.stringify(output, null, 2);
					}
				} catch (e) {
					samp.className = 'error';
					samp.textContent = e.message;
				}
			})(code.textContent, samp);
		});

		prettyPrint();
	}
};

