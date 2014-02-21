# docleaves

Interleaved documents

[View a demonstration](http://git.macropus.org/docleaves/demo/)

## Usage

Somewhere in `<head>`:
  
    <link rel="stylesheet" href="https://netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="http://git.macropus.org/docleaves/docleaves.css">
    
In `body`:

    <xmp class="container" theme="united">
        <!-- Markdown here -->
        
        <!-- an example block -->
        <script type="text/eval+javascript">
        return ['example']; // return a variable, HTML element, or Promise
        </script>
    </xmp>
    
At the end of `body`:

    <script src="http://strapdownjs.com/v/0.2/strapdown.js"></script>
    <script src="http://git.macropus.org/docleaves/docleaves.js"></script>
    <script>docleaves.ready();</script>
    
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
