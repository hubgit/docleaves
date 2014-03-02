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

	prepare: function(node){
		var pre = node.parentNode;
		var script = node.textContent.trim(); // FIXME: using textContent as Marked escapes < in code blocks;

		var sibling = pre.nextSibling;
		while (sibling && (sibling.nodeType != Node.ELEMENT_NODE)) {
			sibling = sibling.nextSibling;
		}
		var auto = !(sibling && sibling.nodeName == 'BUTTON');

		var figure = docleaves.create('figure', {
			className: auto ? 'leaf auto' : 'leaf'
		});
		figure.appendChild(node);

		pre.parentNode.insertBefore(figure, pre);
		pre.parentNode.removeChild(pre);

		var textarea = docleaves.create('textarea', { innerHTML: script });
		figure.appendChild(textarea);

		var samp = docleaves.create('samp');
		figure.appendChild(samp);

		var editor = CodeMirror.fromTextArea(textarea, {
		    mode: 'javascript',
		    lineNumbers: true,
		    theme: 'blackboard',
		    gutters: ["CodeMirror-lint-markers"],
		    lint: true
		});

		if (auto) {
			docleaves.queue.push(figure);

			editor.on('change', function(cm) {
				docleaves.execute(editor.getValue(), samp);
		  	});
		} else {
			sibling.className = 'btn btn-primary';
			sibling.setAttribute('type', 'button');
			sibling.addEventListener('click', function(event) {
				event.preventDefault();
				docleaves.run(figure);
			});

			//figure.insertBefore(sibling, samp);
		}

		node.parentNode.removeChild(node);
	},

	run: function(figure) {
		var samp = figure.querySelector('samp');
		var script = figure.querySelector('textarea').textContent;
		docleaves.execute(script, samp);
	},

	error: function(message, samp) {
		samp.className = 'error';
		docleaves.done(message, samp);
	},

	done: function(output, samp) {
		samp.className = 'success';

		var outputType = docleaves.typeof(output);

		switch (outputType) {
			case undefined:
				if (output instanceof HTMLElement) {
					samp.appendChild(output);
				} else if (!samp.firstChild) {
					samp.parentNode.removeChild(samp);
				}
			break;

			case 'string':
				samp.textContent = output;
				//hljs.highlightBlock(samp);
			break;

			case 'function':
				samp.textContent = output.toString();
				hljs.highlightBlock(samp);
			break;

			case 'promise':
				return output.then(function(output) {
					docleaves.done(output, samp);
				}, function(message) {
					console.log(message);
					docleaves.error(message, samp);
				});

			case 'array':
			default:
				samp.textContent = JSON.stringify(output, null, 2);
				hljs.highlightBlock(samp);
			break;
		}

		if (docleaves.queue.length) {
			docleaves.run(docleaves.queue.shift());
		}
	},

	execute: function(script, samp) {
		samp.className = 'running';

		try {
			docleaves.done(new Function('output', script)(samp), samp);
		} catch (e) {
			console.log(e.stack);
			docleaves.error(e.stack, samp);
		}
	},

	load: function() {
		var link = docleaves.create('link', {
			rel: 'stylesheet',
			href: docleaves.base + 'docleaves.css'
		});
		document.head.appendChild(link);

		var link = document.querySelector('link[rel=source][type="text/markdown"]');
		docleaves.get(link.getAttribute('href'), 'text').then(docleaves.ready);
	},

	ready: function(markdown) {
		var container = docleaves.create('div', {
			className: 'container',
			innerHTML: marked(markdown)
		});

		document.body.appendChild(container);

		docleaves.select('p > img', container).forEach(function(img) {
			var figure = document.createElement('figure');
			// TODO: wrap image in figure and create caption from alt text
		});

		// add data-element attributes
		docleaves.select('*', container).forEach(function(node) {
			switch (node.nodeName) {
				case 'H1':
					node.setAttribute('data-element', '#');
					break;

				case 'H2':
					node.setAttribute('data-element', '##');
					break;

				case 'H3':
					node.setAttribute('data-element', '###');
					break;

				default:
					var style = window.getComputedStyle(node);

					if (style.display == 'block') {
						node.setAttribute('data-element', node.nodeName.toLowerCase());
					}

					break;
			}

			// http://stackoverflow.com/a/15993398/145899

			node.onclick = function() {
				this.contentEditable = true;
                this.focus();
			}

			node.onmouseout = function() {
				this.contentEditable = false;
				this.blur();
				//this.outerHTML = marked(this.innerHTML);
			}

			// TODO: keypress for new paragraph
		});

		// prepare each leaf
		docleaves.select('pre > code.lang-js').forEach(docleaves.prepare);

		// run each script
		if (docleaves.queue.length) {
			docleaves.run(docleaves.queue.shift());
		}
	},

	require: function() {
		var url = docleaves.base + docleaves.requirements.shift();
		var onload = docleaves.requirements.length ? docleaves.require : docleaves.load;
		var script = docleaves.create('script', { src: url }, { load: onload });

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
	},

	select: function(selector, root) {
		root = root || document;

		return Array.prototype.slice.call(root.querySelectorAll(selector));
	},

	create: function(name, attributes, events) {
		var node = document.createElement(name);

		if (attributes) {
			Object.keys(attributes).forEach(function(key) {
				switch (key) {
					case 'textContent':
					case 'innerHTML':
					case 'className':
						node[key] = attributes[key];
						break;

					default:
						node.setAttribute(key, attributes[key]);
						break;
				}
			});
		}

		if (events) {
			Object.keys(events).forEach(function(key) {
				node.addEventListener(key, events[key]);
			});
		}

		return node;
	},

	typeof: function(object) {
		switch (Object.prototype.toString.call(object)) {
			case '[object Object]':
				return 'object';

			case '[object Array]':
				return 'array';

			case '[object String]':
				return 'string';

			case '[object Function]':
				return 'function';

			case '[object Promise]':
				return 'promise';
		}
	}
};

document.addEventListener('DOMContentLoaded', docleaves.require);
