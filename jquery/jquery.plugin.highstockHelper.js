/*!
 * jQuery Timed Event
 * Copyright Stephen Macchia
 * Licensed under the MIT license
 */
/**
 * @title Custom chart helper
 * @Author Stephen Macchia
 * @version 1.0
 * @description plugin for chart reuse. Also provides an API into HighStock for some common methods and initalises the theme once
 * @example <div id="myChart" class="sampleChart" data-feed-url="jsonsample.json" data-live-update="true" data-title="Spot Prices per oz" data-series-name="oz"></div>
 */

;(function ( $, Highcharts ) {
    var pluginName = "highstockHelper"
        , chart
        , theme
        , hc = Highcharts
        , primaryLightColour = '#f9f6f2'
        , primaryColour = '#bc8420'
        , primaryText = "#2d2d2d"
        , primaryLightText = "#c7c5c2"
        , lineColour = primaryLightText
        , base = this;

    // Base theme for charts
    theme = {
        chart: {
            reflow: false,
            backgroundColor: primaryLightColour,
            plotBorderColor: '',
            plotBorderWidth: 2,
            marginBottom: 50,
            //marginLeft: 45,
            type: 'areaspline'
        },
        // various plot colours in order of preference
        colors: [primaryColour],
        credits: {
            enabled: false,  // default is true
            itemStyle: {
                color: primaryText,
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
                backgroundColor: primaryColour,
                borderColor: primaryLightText
            },
            maskFill: 'rgba(0, 0, 0, 0.1)',
            outlineWidth: 0,
            series: {
                lineColor: primaryColour,
                type: 'areaspline',
                color: primaryColour,
                fillOpacity: 0.9
            },
            xAxis: {
                labels: {
                    style: {
                        color: primaryLightText
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
                    color: primaryText,
                    fontWeight: 'bold'
                },
                states: {
                    hover: {
                        fill: primaryColour,
                        stroke: 'none'
                    },
                    select: {
                        style: {
                            color: '#ffffff'
                        },
                        fill: primaryColour,
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
            barBackgroundColor: primaryColour,
            barBorderRadius: 5,
            barBorderWidth: 0,
            buttonArrowColor: '#ffffff',
            buttonBackgroundColor: primaryColour,
            buttonBorderWidth: 0,
            buttonBorderRadius: 3,
            rifleColor: '#fff', // colour in middle of track
            trackBackgroundColor: '#ffffff',
            trackBorderWidth: 1,
            trackBorderRadius: 5,
            trackBorderColor: primaryLightColour
        },
        title: {
            align: 'left',
            style: {
                color: '#666666',
                fontWeight: 'bold',
                fontSize: '30px'
            }
        },
        tooltip: {
            backgroundColor: '#000',
            borderWidth: '0',
            //shadow: false, // default is true
            style: {
                color: '#fff',
                fontSize: '12px',
                padding: '8px'
            },
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
            lineColor: primaryLightText, // series on bottom
            title: {
                style: {
                    fontWeight: 'normal',
                    fontSize: '11px'
                }
            }
        },
        yAxis: {
            gridLineColor: lineColour,
            labels: {
                style: {
                    color: '#333333'
                }
            },
            title: {
                style: {
                    fontWeight: 'normal',
                    fontSize: '11px',
                    position: 'absolute'
                }
            }
        }
    };

    //apply theme to base chart object
    hc.setOptions(theme);

    chart = function ( el, options ) {



        /**
         * @desciption jQuery version of the element
         * @type {*|HTMLElement}
         */
        base.$el = $(el);

        /**
         * @description html version of the element
         * @type {*}
         */
        base.el = el;

        /**
         * @description Initalisation function. Assigns the start countdown time and triggers
         */
        base.init = function () {
            base.options = $.extend({}, chart.defaultOptions, options);

            if( !base.options.isLazy ){
                _getChartData();
            }

            base.$el.on("chart.destroy", _destroy);
            base.$el.on("chart.addPoint", _addPoint);
            base.$el.on("chart.recreate", _getChartData);
        };

        function _getChartData(){
            // Kill an active instance if it already exists
            if( typeof base.chart !== "undefined") {
                base.chart.destroy();
                base.chart = null;
            }

            $.get(base.options.feedUrl, function(data){
                var ops = {
                    series : [{
                        name : base.options.seriesName,
                        data : data,

                        fillColor: 'rgba(255,255,255,0.4)',
                        tooltip: {
                            valueDecimals: 2
                        }
                    }],
                    title: {text :base.options.title},
                    chart:{renderTo:document.getElementById(base.options.id)}
                }

                base.chart = new hc.StockChart(ops);
            });
        }

        /**
         * @description Unbind all events of this chart instance, kill the chart, then de-register this instance of the plugin
         *
         * @private
         */
        function _destroy(){
            console.log("destroy triggered");
            base.chart.destroy();

            // clear out custom events
            base.$el.off("chart.addPoint");
            base.$el.off("chart.recreate");
            base.$el.off("chart.destroy");

            base.$el.removeData();
            base = null;

        }

        /**
         * @description Add a single point to the chart instance
         * @param e
         * @param point {array} [time in miliseconds, value]
         * @returns {*}
         * @private
         */
        function _addPoint (e, point){
            var series = base.chart.series[0]
                , timeTest;

            // make sure we have 2 values
            if(point.data.length != 2){
                return console.warn(options.feedUrl + " : Expecting [time in milliseconds, value] to be returned");

            }else{
                timeTest = new Date(point.data[0]);

                // got to love the prototypes magic strings
                if(timeTest == "Invalid Date"){
                    return console.warn(options.feedUrl + " : point[0] isn't a valid time. " + point.data[0] +" converted to " + timeTest.toString());
                }
            }

            series.addPoint(point.data, true, true);

        }

        base.init();
    };

    /**
     * Default options
     * @type {{emitEvent: string, emitTarget: boolean, time: number}}
     */
    chart.defaultOptions = {
        isLazy: false
    };

    /**
     * Creates the plugin instance on
     * @param options
     * @returns {*}
     * @constructor
     */
    $.fn[pluginName] = function (  options ) {
        return this.each(function () {

            var $this = $(this)
                , options = options || {};

            options.feedUrl = $this.data('feedUrl');
            options.liveUpdate =$this.data('liveUpdate') || false;
            options.title = $this.data('title') || "Chart";
            options.id = $this.attr("id") || false;
            options.seriesName = $this.data("seriesName") || "";



            // must have an ID to be able to render the chart
            if(!options.id){
                return console.warn("No id passed when trying to display a chart");

            }else if( !options.liveUpdate ){
                return console.warn("No liveUpdate url passed. <div data-live-update='path/to/server'></div> We need to get the data somehow");
            }

            ( new chart(this,  options));
        });
    };

})( jQuery, Highcharts );