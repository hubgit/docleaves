# D3 Nest examples

## Asynchronous call

```js
return docleaves.get('https://peerj.com/articles/index.json', 'json').then(function(data) {
	collection = data._items;
});
```

## Single-level nest: group by subject

```js
nested = d3.nest().key(function(d)  {
	return d.subjects[0];
});

return nested.entries(collection);
```

## Use rollup to count leaves

The leaf level is replaced by a value at the parent level

```js
return nested.rollup(function(leaves) {
	return leaves.length;
}).entries(collection);
```

## Rollup does sums as well

```js
return nested.rollup(function(leaves) {
	return {
		length: leaves.length,
		total_subjects: d3.sum(leaves, function(d) {
			return d.subjects.length;
		})
	};
}).entries(collection);
```

## Rollup everything to get a grand total of number of items

```js
return d3.nest().rollup(function(leaves) {
	return leaves.length;
}).entries(collection);
```

## Sorting

Each level can be sorted by key - ascending or descending

```js
return nested.sortKeys(d3.ascending).rollup(function(leaves) {
	return leaves.length;
}).entries(collection);
```

## Sorting - custom order

```js
var sticky = ['Paleontology', 'Ecology'];

sorted = nested.sortKeys(function(a,b) {
	return sticky.indexOf(b) - sticky.indexOf(a);
}).rollup(function(leaves) {
	return leaves.length;
});

return sorted.entries(collection);
```

## Sorting - sort the leaves by value

```js
return sorted.sortValues(function(a,b) {
	return a.date > b.date ? 1 : -1;
}).entries(collection);
```

## Populate a select list

```js
var items = d3.nest().key(function(d) {
	return d.subjects[0];
}).sortKeys(d3.ascending).rollup(function(leaves) {
	return leaves.length;
}).entries(collection);

var output = document.createElement('div');
var select = d3.select(output).append('select');

select.selectAll('option').data(items).enter().append('option').attr('value', function(d) {
	return d.key;
}).text(function(d) {
	return d.key;
});

return output;
```
