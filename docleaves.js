'use strict';

if (typeof window.Promise != 'function') {
	alert('This requires a browser that supports ES6 Promises, e.g. Chrome 32');
}

var scripts = document.getElementsByTagName('script');

var docleaves = {
	queue: [],
	base: scripts[scripts.length - 1].getAttribute('src').replace(/\/[^\/]*$/, '/'),
	requirements: [
		'vendor/d3/d3.js',
		'vendor/marked/lib/marked.js',
		'vendor/codemirror/lib/codemirror.js',
		'vendor/codemirror/mode/javascript/javascript.js',
		'vendor/highlight/highlight.pack.js'
	],
	convert: function(node) {
		console.log('convert');
		node.innerHTML = marked(node.innerHTML);
		node.style.display = 'block';
	},
	prepare: function(node){
		var figure = document.createElement('figure');
		node.parentNode.insertBefore(figure, node);

		var textarea = document.createElement('textarea');
		textarea.innerHTML = node.innerHTML.trim();;
		figure.appendChild(textarea);

		var editor = CodeMirror.fromTextArea(textarea, {
		    mode: 'javascript',
		    lineNumbers: true,
		    theme: 'blackboard'
		});

		var samp = document.createElement('samp');
		samp.textContent = node.getAttribute('placeholder');
		figure.appendChild(samp);

		node.parentNode.removeChild(node);

		docleaves.queue.push(figure);
	},

	run: function() {
		if (!docleaves.queue.length) {
			return;
		}

		var figure = docleaves.queue.shift();
		var samp = figure.querySelector('samp');
		var script = figure.querySelector('textarea').textContent;

		var error = function(message) {
			samp.className = 'error';
			done(message);
		};

		var done = function(output) {
			samp.className = 'success';
			if (output instanceof Promise) {
				return output.then(done, error);
			} else if (output instanceof HTMLElement) {
				samp.appendChild(output);
			} else {
				samp.textContent = JSON.stringify(output, null, 2);
				hljs.highlightBlock(samp);
			}

			docleaves.run();
		};

		(function(script, node) {
			samp.className = 'running';

			try {
				done(new Function(script)());
			} catch (e) {
				error(e.message);
			}
		})(script, samp);
	},

	ready: function() {
		// convert the Markdown
		Array.prototype.forEach.call(document.querySelectorAll('.markdown'), docleaves.convert);

		// prepare each leaf
		Array.prototype.forEach.call(document.querySelectorAll('.leaf'), docleaves.prepare);

		// run each script
		docleaves.run();
	},

	require: function(callback) {
		var script = document.createElement('script');
		script.src = docleaves.base + docleaves.requirements.shift();
		script.onload = docleaves.requirements.length ? docleaves.require : docleaves.ready;
		document.body.appendChild(script);
	}
};

document.addEventListener('DOMContentLoaded', function() {
	docleaves.require();
});
