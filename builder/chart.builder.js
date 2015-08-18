/**
Chart builder
*/

$(document).ready(function () {
    var _tempStore;
    // Initial Load of data -----------------
    $(document.getElementById('loadData')).on('click', function () {
        var $this = $(this),
            data = $(document.getElementById('csvData')).val(),
            chartType = $('#chartType').val() || 'line',
            seriesCount, seriesAxis = '', i = 0, temp;

        // parse CSV and stash it in allowed data store

        temp = chart.convertCsv(data, chartType);
        _tempStore = chart.data(temp);
        // cache length of series incase its long
        seriesCount = temp.series.length;

        // create dynamic series section
        for (; i < seriesCount; i++) {
            seriesAxis += '<div class="row"><strong class="title">' + temp.series[i].name + '</strong>'
                        + '<label><input type="checkbox" name="seriesY-Axes' + i + '" value="0" data-seriesIndex="' + i + '" />Axis 1</label>'
                        + '<label class="yaxis2"><input type="checkbox" name="seriesY-Axes' + i + '" value="1" data-seriesIndex="' + i + '" />Axis 2</label>'
                        + '</div>';
        }

        // Append dynamic series to screen for options
        $(document.getElementById('seriesList')).html(seriesAxis);

        // disable data fields
        $('#csvData, #chartType, #txtFileLocation').attr('disabled', 'disabled');

        // Fade out this button
        $this.fadeOut();
        $('.post-load').fadeIn();
    });

    // Reload CSV data -----------------
    $(document.getElementById('enableData')).on('click', function () {
        // enable data fields
        $('#csvData, #chartType, #txtFileLocation').removeAttr('disabled');
        $('input[name=y-axes]').removeAttr('checked');

        // 
        $('.post-load').fadeOut();

        // turn off fields needed to populate later
        $(document.getElementById('loadData')).fadeIn();

        //clear the chart data
        //delete chart.data;

    });

    // Preview the chart -----------------
    $(document.getElementById('previewChart')).on('click', function () {

        // Collext data from admin panels
        var context = $(document.getElementById('chartAdmin')),
            title = $('#txtTitle').val() || 'WIB IQ',
            source = $('#txtSource').val() || false,
            fileLocation = $('#txtFileLocation').val() || 'not stored',
            chartType = $('#chartType').val() || 'line',
            chartWidth = parseInt($('#chartWidth').val()) || 500,
            xAxisTitle = $('#txtX-AxisTitle').val() || '',
            yAxisCount = context.find('input[name=y-axes]:checked').val() || 1,
            yAxis1Title = $('#txtY-Axis1Title').val() || '',
            yAxis2Title = $('#txtY-Axis2Title').val() || '',
            hideXaxisValues = $('#hideXaxisValues') || false,
            hideY1axisValues = $('#hideY1axisValues') || false,
            hideY2axisValues = $('#hideY2axisValues') || false,
            seriesSelect = $('#seriesList input:checked') || 0,
            rotateXAxis = parseInt($('#rotateXAxis').val()) || 0,
            data = _tempStore || false, // Stored data from earlier parse
            options;

        // can't find the data, lets reparse and assign 
        if (!data) {
            data = chart.data = chart.convertCsv($(document.getElementById('csvData')).val());
        }

        // Assign base values to options
        options = {
            chart: {
                renderTo: 'chart',
                height: 400,
                width: chartWidth
            },
            xAxis: {

                type: 'linear',
                title: {
                    text: xAxisTitle
                },
                labels: {
                    enabled: !hideXaxisValues.is(":checked"),
                    rotation: rotateXAxis
//                    ,
//                    align: 'bottom'
                }
            },
            series: data.series,
            title: {
                text: title
            }
        };

        if (chartType != 'stock') {
            options.chart.type = chartType;
            options.xAxis.categories = '';
        } else {
            options.xAxis.categories = data.categories || data.xAxis.categories;
        }

        // Add the source to the chart
        if (source) {
            options.credits = {
                enabled: true,
                text: "Source: " + source
            };
            options.chart.spacingBottom = 25;
        }

        // Add spacing if the labels are rotated 45deg
        if (rotateXAxis === 45) {
            options.chart.spacingRight = 45;
        }

        // Check if there are two y axis
        if (yAxisCount == 2) {

            // Set the relevant series to the correct y-axis
            $.each(seriesSelect, function () {
                var i = $(this).attr('value'),
                        yAxis = $(this).attr('data-seriesIndex');

                options.series[yAxis].yAxis = parseInt(i);
            });

            options.yAxis = [{
                labels: {
                    enabled: !hideY1axisValues.is(":checked")
                },
                title: {
                    text: yAxis1Title,
                    align: 'high', //Bug 5208 
                    offset: 0,
                    rotation: 0,
                    textAlign: 'left',
                    y: -10
                }
            },
                {
                    labels: {
                        enabled: !hideY2axisValues.is(":checked")
                    },
                    title: {
                        text: yAxis2Title,
                        align: 'high', //Bug 5208 
                        offset: 0,
                        rotation: 0,
                        textAlign: 'left',
                        y: -10
                    },
                    opposite: true
                }];

            // Nope, maybe just 1 title    
        } else if (yAxisCount == 1) {

            // Reset the y-axis display for all series
            $.each(options.series, function (index) {
                options.series[index].yAxis = 0;
            });

            options.yAxis = {
                labels: {
                    enabled: !hideY1axisValues.is(":checked")
                },
                title: {
                    text: yAxis1Title,
                    align: 'high', //Bug 5208 
                    offset: 0,
                    rotation: 0,
                    textAlign: 'left',
                    y: -10
                }
            };

        }

        // If it is an area chart they want, stack it (looks better)
        if (chartType === 'area') {
            options.plotOptions = {
                area: {
                    stacking: 'normal'
                }
            };
        }

        // reassign options becasue we have rebuilt them
        // TODO: see why hc.StockChart is killing the series field
        _tempStore = chart.data(options);

        $('#chart').css('border', 'none');

        // Make the chart
        chart.display(options, chartType);

    });

    // Turn the series fields on/off -----------------
    $('input[name=y-axes]').on('change', function () {
        var $this = $(this),
            axis = $this.val();

        if (axis == 2) {
            $(".yaxis2").fadeIn();
            $(document.getElementById('seriesListCont')).fadeIn();
        } else {
            $(".yaxis2").fadeOut();
            $(document.getElementById('seriesListCont')).fadeOut();
            $(document.getElementById('seriesListCont')).find('input:checked').removeAttr('checked');
            $(document.getElementById('txtY-Axis2Title')).val('');
        }
    });

    $("#saveChart").on("click", function () {
        var $this = $(this),
            options = _tempStore,
            opsString = JSON.stringify(options);

        chart.createImage(options, gv.siteRoot + "Handlers/SVGConverter.ashx", function (imagePath) {
            // do something with the return string.

            var context = $(document.getElementById('chartAdmin')),
            graphJson = {
                GraphId: 0,
                CSVData: $('#csvData').val(),
                ChartDataExtended: opsString,
                Comments: $('#txtComments').val() || '',
                FileReferenceLocation: $('#txtFileLocation').val(),
                ImageLocation: imagePath,
                Source: $('#txtSource').val(),
                Title: $('#txtTitle').val(),
                Type: $('#chartType').val()
            };

            $.ajax({ type: "POST",
                url: "Handlers/GraphInsert.ashx",
                //async: false,
                dataType: "json",
                data: graphJson,
                success: function (data) {
                    $("body").removeClass("modal-fake");
                    // var newId = data.GraphID; unused
                    GraphModule.WysiwygReplace("#" + GraphModule.GraphSelectorId, "<a href=\"" + data.ImageLocation + "\" class=\"chart\" data-chartID=\"" + data.GraphID + "\" data-chartType=\"" + data.Type + "\"><img src=\"" + data.ImageLocation + "\" alt=\"" + data.Title + "\" /> </a>");

                    // reset values and text entry boxes to nothing
                    $('#chartAdmin input:checked').removeAttr("checked");
                    $('#chartAdmin input[type=text]').val("");
                    $('#chartAdmin textarea').val("");
                    $('#chartAdmin textarea, #chartAdmin input[type=text]').removeAttr("disabled");

                    // display
                    $('#loadData').show();

                    // make sure stuff is hidden
                    $('.post-load').hide();

                    // clear
                    $('#chart').html('');

                },
                error: function (jxr, text, error) {
                    console.log(text);
                }
            });



        });
        return false;
    });
});