'use strict';

if (typeof window.Promise != 'function') {
	alert('This requires a browser that supports ES6 Promises, e.g. Chrome 32');
}

var scripts = document.getElementsByTagName('script');

var docleaves = {
	queue: [],
	base: scripts[scripts.length - 1].getAttribute('src').replace(/\/[^\/]*$/, '/'),
	requirements: [
		'vendor/marked/lib/marked.js',
		'vendor/codemirror/lib/codemirror.js',
		'vendor/codemirror/mode/javascript/javascript.js',
		'vendor/highlight/highlight.pack.js'
	],

	convert: function(node) {
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

		if (node.className.match(/\bauto\b/)) {
			docleaves.queue.push(figure);
		} else {
			var button = document.createElement('button');
			button.className = 'btn btn-primary'
			button.textContent = 'Run';
			button.addEventListener('click', function(event) {
				event.preventDefault();
				docleaves.run(figure);
			});
			samp.appendChild(button);
		}

		node.parentNode.removeChild(node);
	},

	run: function(figure, output) {
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

			if (docleaves.queue.length) {
				docleaves.run(docleaves.queue.shift(), output);
			}
		};

		(function(script, node) {
			samp.className = 'running';

			try {
				done(new Function('input', script)(output));
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
		if (docleaves.queue.length) {
			docleaves.run(docleaves.queue.shift());
		}
	},

	require: function() {
		var script = document.createElement('script');
		script.src = docleaves.base + docleaves.requirements.shift();
		script.onload = docleaves.requirements.length ? docleaves.require : docleaves.ready;
		document.body.appendChild(script);
	},

	get: function(url, responseType) {
		return new Promise(function(resolve, reject) {
			var xhr = new XMLHttpRequest;

			xhr.onload = function() {
				resolve(xhr.response, xhr.statusText, xhr);
			};

			xhr.onerror = function() {
				reject(xhr.statusText, xhr);
			};

			xhr.open('GET', url);
			xhr.responseType = responseType || 'json';

			xhr.send();
		});
	}
};

document.addEventListener('DOMContentLoaded', docleaves.require);
