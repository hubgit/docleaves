# docleaves

Interleaved documents

[View a demonstration](http://git.macropus.org/docleaves/demo/)

## Usage

`index.html`:

    <!doctype html>
    <meta charset="utf-8">
    <title>Your Example Title</title>
    <script src="../docleaves.js"></script>
    <link rel="source" type="text/markdown" href="your-example.md">

`your-example.md`:

    # Example Title

    ```js
    // return data, a HTML element, or a Promise
    return new ExampleCollection();
    ```

    <!-- add a button after the block to prevent automatic execution -->
    <button>Run</button>