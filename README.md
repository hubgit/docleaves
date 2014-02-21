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
        
        <script type="text/eval+javascript">
        return ['example'];
        </script>
    </xmp>
    
At the end of `body`:

    <script src="http://strapdownjs.com/v/0.2/strapdown.js"></script>
    <script src="http://git.macropus.org/docleaves/docleaves.js"></script>
    <script>docleaves.ready();</script>
    
## Global variables

To share data between blocks, use a global variable:

    <script>
    var $scope = {};
    </script>

    <script type="text/eval+javascript">
    $scope.data = { name: 'example' };
    return $scope.data;
    </script>
