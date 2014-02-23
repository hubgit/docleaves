# docleaves

Interleaved documents

[View a demonstration](http://git.macropus.org/docleaves/demo/)

## Usage

Somewhere in `<head>`:

    <link href="http://git.macropus.org/docleaves/docleaves.css" rel="stylesheet">
    <script src="http://git.macropus.org/docleaves/docleaves.js"></script>

In `body`:

    <article class="container markdown">
        <!-- Markdown here -->

        <!-- an example block -->
        <script type="text/eval+javascript" class="leaf">
        return ['example']; // return data, HTML element, or Promise
        </script>
    </article>

## Global variables

To share data between blocks, use a global variable:

    <!-- generic script element -->
    <script>
    var $scope = {};
    </script>

    <!-- first block -->
    <script type="text/eval+javascript">
    $scope.data = { name: 'example' };
    </script>

    <!-- second block -->
    <script type="text/eval+javascript">
    return {
      name: $scope.data.name,
      title: 'Test data'
    }
    </script>
