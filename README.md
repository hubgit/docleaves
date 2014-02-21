# docleaves

Interleaved documents

## Usage

Somewhere in `<head>`:
  
    <link rel="stylesheet" href="https://netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="http://git.macropus.org/docleaves/docleaves.css">
    
In `body`:

    <xmp class="container" theme="united">
        <!-- Markdown here -->
    </xmp>
    
At the end of `body`:

    <script src="http://strapdownjs.com/v/0.2/strapdown.js"></script>
    <script src="http://git.macropus.org/docleaves/docleaves.js"></script>
    
    <script type="text/eval+javascript">docleaves.ready();</script>
    
## Global `$scope` variable

Data that needs to be shared between blocks can be added to the global `$scope` variable

    <script>
    var $scope = {};
    
    d3.csv('data.csv', function(data) {
    	$scope.data = data;
    	docleaves.ready();
    });
    </script>
