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
		'vendor/jshint/jshint.js',
		'vendor/codemirror/lib/codemirror.js',
		'vendor/codemirror/mode/javascript/javascript.js',
		'vendor/codemirror/addon/lint/lint.js',
		'vendor/codemirror/addon/lint/javascript-lint.js',
		'vendor/highlight/highlight.pack.js',
		'vendor/pouchdb/pouchdb.js'
	],

	convert: function(node) {
		var scripts = node.querySelectorAll('script.leaf');

		var contents = Array.prototype.map.call(scripts, function(script) {
			var content = script.innerHTML;
			script.innerHTML = '';
			return content;
		});

		node.innerHTML = marked(node.innerHTML);

		var scripts = node.querySelectorAll('script.leaf');

		Array.prototype.forEach.call(scripts, function(script, index) {
			script.innerHTML = contents[index];
		});

		node.style.display = 'block';
	},

	prepare: function(node){
		var figure = node.parentNode;

		if (figure.nodeName != 'FIGURE') {
			figure = document.createElement('figure');
			node.parentNode.insertBefore(figure, node);
			figure.appendChild(node);
		}

		figure.className = figure.className += ' leaf';

		var textarea = document.createElement('textarea');
		textarea.innerHTML = node.innerHTML.trim();
		figure.appendChild(textarea);

		var samp = document.createElement('samp');
		samp.textContent = node.getAttribute('placeholder');
		figure.appendChild(samp);

		var editor = CodeMirror.fromTextArea(textarea, {
		    mode: 'javascript',
		    lineNumbers: true,
		    theme: 'blackboard',
		    gutters: ["CodeMirror-lint-markers"],
		    lint: true
		});

		if (node.className.match(/\bauto\b/)) {
			docleaves.queue.push(figure);
		} else {
			var button = document.createElement('button');
			button.className = 'btn btn-primary'
			button.textContent = 'Run';
			button.addEventListener('click', function(event) {
				event.preventDefault();
				button.parentNode.removeChild(button);
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
			} else if (output instanceof Function) {
				samp.textContent = output.toString();
				hljs.highlightBlock(samp);
			} else if (typeof output == 'string') {
				samp.textContent = output;
				hljs.highlightBlock(samp);
			} else if (typeof output != 'undefined') {
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
				done(new Function('input', 'output', script)(output, samp));
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
