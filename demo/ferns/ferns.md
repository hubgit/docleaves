# Fractal Ferns in D3

## Background

### What are fractals?

Fractal geometry describes how how visual complexity can be created from simple rules.  It's a relatively recent invention largely because it depends on the ability to carry out a large number of iterations on a set of simple rules - something that is ideally suited for computers.  The word fractal was coined by the creator of fractal geometry, Benoit Mandelbrot, in 1975 to describe the fractured looking forms that are often seen in the nature world in everything from plants to mountain ranges.

![A Julia Set](https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Julia_set_%28ice%29.png/256px-Julia_set_%28ice%29.png)

Fractals are mathematical entities that display self-similar patterns - they can be examined at many levels of magnification and look identical (or at least similar) because of their repeating, recursive nature.  Here we are looking at fractal ferns and this video does an excellent job of showing how this type of fractal, given a sufficient number of points, can be zoomed into infinitely (theoretically) and will continue to repeat the same pattern.  Fractal ferns, also known as Barnsley Ferns, are just one of many well documented fractals out there that can be produced in a similar iterative fashion.  Julia sets are one of the other types of fractals I considered using for this first post on fractals.

## Collect

### Generate the points

The basic idea is that we want to generate each successive point based on the coordinates of the point that comes before it.  In the coords function the coordinates (x, y) of the current (or base) point are passed in the and the coordinates for the new point are returned.  The only trick is that we have four sets of different coefficients that we want to be applied with a certain probability.  We want to the first set 70.1% of the time, the second set 15%, the third set 12.9%, and the fourth set just 2% of the time.  Random parameter p takes care of selecting the correct set of coefficients.  If you really want to understand the coefficients at a deeper level you can read the wikipedia page on Barnsley Ferns.  There is also some discussion of how to tweak the coefficients to achieve different types of ferns.

```js
FernPoints = function(n) {
    this.currentPoint = { c: 0, x: 0, y: 0 };
    this.points = [ this.currentPoint ];

    for (var i = 0; i < n; i++) {
        this.currentPoint = this.nextPoint();
        this.points.push(this.currentPoint);
    }
};

FernPoints.prototype.nextPoint = function() {
    var p = Math.random(),
        x = this.currentPoint.x,
        y = this.currentPoint.y;

    if (p <= 0.701) {
        return {
            c: 0,
            x: 0.81 * x + 0.07 * y + 0.12,
            y: -0.04 * x + 0.84 * y + 0.195
        };
    }

    if (p <= 0.851) {
        return {
            c: 1,
            x: 0.18 * x - 0.25 * y + 0.12,
            y: 0.27  * x + 0.23 * y + 0.02
        };
    }

    if (p <= 0.980) {
        return {
            c: 2,
            x: 0.19 * x + 0.275 * y + 0.16,
            y: 0.238 * x - 0.14 * y + 0.12
        };
    }

    return {
        c: 3,
        x: 0.0235 * x + 0.087 * y + 0.11,
        y: 0.045 * x + 0.1666 * y
    };
};
```

```js
var collection = new FernPoints(8);

return collection.points;
```

## Visualise

### Fern Renderer

```js
Fern = function(container) {
    this.colors = [ '#006600', '#663333', '#CC0033', '#330099' ];

    // for resizing
    this.container = container;

    // create the svg element and append it to the container
    this.svg = d3.select(container)
        .append('svg')
        .attr('width', 1)
        .attr('height', 1)
        .attr('viewBox', '0 0 1 1');

    this.fern = this.svg.append('g');

    // resize the svg element to fit the container
    this.resize();

    // listen for resize events
    window.addEventListener('resize', this.resize.bind(this));
};
```

### Drawing points

The drawPoint function is called repeatedly to create the points.  The function calls out to the getCoords function using the current base point's coordinates (A) and then resets the base point to the new point's coordinates (B) for the next iteration.  The "colors" flag (C) is really only needed for these examples, so it can be ignored if you just want to generate the basic fractal.  The final step is to call renderPoint using the coordinates received from the getCoords function.  You'll notice that I am applying one last tweak based on the height and width to the point's X and Y values to get the visualization positioned correctly within the SVG.

```js
Fern.prototype.data = function(points) {
    var colors = this.colors;

    this.fern
        .selectAll('circle')
        .data(points)
        .enter().append('circle')
            .style('fill', function(point) {
                return colors[point.c];
            })
            .attr('cx', function(point) {
                return point.x;
            })
            .attr('cy', function(point) {
                return point.y;
            })
            .attr('r', 0.002);
};
```

### Resizing the SVG

The points that get returned by the getCoords function are very tightly bounded.  Plotting the raw coordinates into pixels fits the entire image with a 2px by 2px SVG element. Translating those coordinates to the appropriate size in pixels for the page could be done using d3's scales to translate from one coordinate to system to another, but I decided to do this in another way since using scales has been pretty well covered out there.  As an added benefit, this method also allows the visualization to be "responsive" as well - scaling up and down based on the size of the browser window.

The key to make the graphic resize according to the window size is adding the "viewBox" attribute to the SVG.

```js
Fern.prototype.resize = function() {
    var size = this.container.offsetWidth - 50;
    this.svg.attr('width', size);
    this.svg.attr('height', size / 2 - 50);
};
```

### Example 1: 10,000 points

```js
var collection = new FernPoints(10000);

fern = new Fern(output);
fern.data(collection.points);
```

<button>Run</button>

### Example 2: 20,000 points

```js
var collection = new FernPoints(20000);

var fern = new Fern(output);
fern.data(collection.points);
```

<button>Run</button>

### Example 3: 50,000 points

```js
var collection = new FernPoints(50000);

var fern = new Fern(output);
fern.data(collection.points);
```

<button>Run</button>

