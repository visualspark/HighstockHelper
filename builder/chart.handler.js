/**
@requires: Highstock Library
@requires: Highstock Export
*/

var chart = (function (Highcharts) {
    var hc = Highcharts,
        theme;

    // Base theme for charts
    theme = {
        chart: {
            reflow: false,
            backgroundColor: '#ffffff', // WIB '#f0efeb'
            plotBorderColor: '#f0efeb',
            plotBorderWidth: 2,
            marginBottom: 100,
            marginLeft: 45
        },
        // Wib colours 
        colors: ['#9f0029', '#8c7d70', '#495761', '#621a4b', '#f7941e', '#0072bc', '#ed0973'],
        credits: {
            enabled: false,  // default is true
            itemStyle: {
                color: '#909090',
                fontSize: '11px'
            },
            position: {
                align: 'left',
                x: 45,
                verticalAlign: 'bottom',
                y: -10
            }
        },
        legend: {
            align: 'left',
            borderWidth: 0,
            enabled: true,
            floating: true,
            verticalAlign: 'bottom',
            x: 25,
            y: 0
        },
        plotOptions: {
            series: {
                shadow: false,
                marker: {
                    enabled: false, //Bug #5204
                    states: {
                        hover: {
                            enabled: true
                        }
                    }
                }
            }
        },
        navigation: {
            buttonOptions: {
                enabled: false
            }
        },
        navigator: {
            // The little sliding part at the bottom of the graph
            handles: {
                backgroundColor: '#7c6e62',
                borderColor: '#ddd6ce'
            },
            maskFill: 'rgba(238, 237, 233, 0.5)',
            outlineWidth: 0,
            series: {
                lineColor: '#a53f55',
                type: 'areaspline',
                color: '#a53f55',
                fillOpacity: 0.9
            },
            xAxis: {
                labels: {
                    style: {
                        color: '#fff'
                    }
                }
            }
        },
        rangeSelector: {
            // the buttons at the top of the chart
            buttonSpacing: 3,
            buttonTheme: {
                // styles for the buttons
                fill: 'none',
                stroke: 'none',
                style: {
                    color: '#333',
                    fontWeight: 'bold'
                },
                states: {
                    hover: {
                        fill: '#ddd6ce',
                        stroke: 'none'
                    },
                    select: {
                        style: {
                            color: '#960026'
                        },
                        fill: '#bebebc',
                        stroke: 'none'
                    }
                }
            },
            labelStyle: {
                color: '#666',
                fontWeight: 'bold'
            },
            selected: 2, // the number of buttons across that defaults
            inputEnabled: false // you can define the buttons here by using- {buttons : [{ type : 'hour', count : 1, text : '1h'}.. ]}
        },
        symbols: ['circle', 'circle', 'circle', 'circle', 'circle'],
        series: [],
        // Scrollbar area
        scrollbar: {
            barBackgroundColor: '#7c6e62',
            barBorderRadius: 5,
            barBorderWidth: 0,
            buttonArrowColor: '#ffffff',
            buttonBackgroundColor: '#a00029',
            buttonBorderWidth: 0,
            buttonBorderRadius: 3,
            rifleColor: '#fff', // colour in middle of track
            trackBackgroundColor: '#ddd6ce',
            trackBorderWidth: 1,
            trackBorderRadius: 5,
            trackBorderColor: '#CCC'
        },
        title: {
            align: 'center',
            style: {
                color: '#aa2948'
            }
        },
        tooltip: {
            backgroundColor: '#dad1ca',
            borderWidth: '0',
            shadow: false, // default is true
            xDateFormat: '%Y' //  %Y-%m-%d
        },
        xAxis: {
            labels: {
                style: {
                    color: '#333333'
                }
            },
            //categories: [],
            gridLineColor: '#ffffff',
            lineColor: '#f0efeb', // series on bottom
            title: {
                style: {
                    fontWeight: 'normal',
                    fontSize: '11px'
                }
            }
        },
        yAxis: {
            gridLineColor: '#ffffff',
            labels: {
                style: {
                    color: '#333333'
                }
            },
            title: {
                style: {//Bug 5208 
                    fontWeight: 'normal',
                    fontSize: '11px',
                    position: 'absolute'
                }
            }
        }
    };

    //apply to base chart object while 
    hc.setOptions(theme);

    function _copyObject(obj) {
        var target = {};
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                target[i] = obj[i];
            }
        }
        return target;
    }

    /**
    Split out the CSV data into the series object
    @type: Private
    @param CSV {object}: The CSV data file from the ajax request
    @param chartType {string}: Type of chart - only 'stock' has effect
    @return options {object}: Series Titles and Series data
    */
    function _convertCsv(CSV, chartType) {

        var data = CSV.replace(/\t/g, ','), // Replace tabs with commas
            lines = data.split('\n'), // spilt out each line of CSV 
            series = [],
            categories = [],
            csvLength, i, t, seriesTitle, lineLength, lineValues;

        // check first line isn't extra
        if (lines[0] === '') {
            lines.shift();
        }

        // Get the series titles
        seriesTitle = lines[0].split(',');

        // clear first item in the array because its the series titles
        lines.shift();

        // check last line isn't extra
        if (lines[(lines.length - 1)].length == 0) {
            lines.pop();
        }

        // Set up container object for each series
        // TODO: Optimise loops
        lineLength = seriesTitle.length;
        for (i = 0; i < lineLength; i++) {
            series.push({
                data: [],
                name: seriesTitle[i]
            });
        }

        // Cache the length
        csvLength = lines.length;

        // TODO: Optimise
        if (chartType != 'stock') {

            // Non Stock chart parse
            for (i = 0; i < csvLength; i++) {

                // split out the line to individual values
                lineValues = lines[i].split(',');

                // iterate through the items in the line
                for (t = 0; t < lineLength; t++) {
                    if (t != 0) {
                        // data: parse to floating point integer and add it to the correct series
                        series[t].data.push(parseFloat(lineValues[t]));
                    } else {
                        // otherwise its a category title
                        categories.push(lineValues[t]);
                    }
                }
            }
        } else {

            // Stock chart parse
            for (i = 0; i < csvLength; i++) {

                // split out the line to individual values
                lineValues = lines[i].split(',');

                // iterate through the items in the line
                for (t = 0; t < lineLength; t++) {

                    // The start of a line, get the new date
                    if (t == 0) {
                        var splitDate = lineValues[t].split(/\//g),
                            date = Date.UTC(splitDate[2], splitDate[1] - 1, splitDate[0]);
                    }
                    // Assign the value
                    series[t].data.push([date, parseFloat(lineValues[t])]);
                }
            }
        }

        // Clear first item because its empty or rubish
        series.shift();

        return { series: series, categories: categories };
    }

    /** Create and image of a chart
    @param ops {object} - The options object
    @param handler {string} - Handler URL location
    @param type {string} - The chart type - only checking if its a stock chart or not
    @param callback {function} - callback function
    */
    function _createImg(ops, handler, type, callback) {
        var svgstring,
            location = handler || '/Handlers/SVGConverter.ashx',
            memory = document.createDocumentFragment(),
            c;

        // check callback is a function
        if (typeof callback !== 'function') {
            callback = false;
        }

        ops.chart.renderTo = memory;

        // create new chart
        if (type != 'stock') {
            c = new hc.Chart(ops);
        }else {
            c = new hc.StockChart(ops);
        }
        svgstring = c.getSVG();

        // special key
        svgstring = svgstring.replace(/</g, '[[[');

        //post chart toolbar handler
        $.ajax({
            url: location + '?type=image/png&width=' + ops.chart.width,
            type: 'POST',
            data: { svg: svgstring },
            success: function (da) {
                var data = da;

                // execute callback
                if (callback) {
                    callback(data);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (errorThrown == "Not Found") {
                    alert("I can't find the image converter. Please check its location: " + location);
                    return;
                }
                alert(jqXHR + " : " + textStatus + " : " + errorThrown);
            }
        });

        // delete objects not needed anymore
        c = null;
        svgstring = null;

    }

    // Display Chart in an interactive state
    function _displayChart(ops, type, callback) {
        //        var options = ops;

        // check callback is a function
        if (typeof callback !== 'function') {
            callback = false;
        }

        //        // If one already exists, destroy it
        if (typeof chart.singleChart !== 'undefined') {
            chart.singleChart.destroy();
        }

        if (type == 'stock') {
            // create new chart
            chart.singleChart = new hc.StockChart(ops);
        } else {
            // create new chart
            chart.singleChart = new hc.Chart(ops);
        }

        // Execute callback
        if (callback) {
            callback();
        }
    }

    /**
    @type: Public
    @method: createImage
    @method: display
    @property: data
    @method: convertCsv
    */
    return chart = {
        createImage: _createImg,
        convertCsv: _convertCsv,
        data: _copyObject,
        display: _displayChart
    };
})(Highcharts);