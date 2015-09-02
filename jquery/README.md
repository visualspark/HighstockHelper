# HighstockHelper :  jQuery wrapper plugin
jQuery wrapper plugin to make highstock chart creation quicker

## Sample use
```
<div id="specialChart"
     class="sampleChart"
     data-feed-url="jsonsample.json"
     data-live-update="path/to/server"
     data-title="Spot Prices per oz"
     data-series-name="oz"></div>
```

## Lazy setup
The chart instance can be setup but no chart drawn to the screen by setting the **isLazy** option. The chart will not fetch the data and display it on success until the event *"chart.recreate"* is triggered on the instance.

This option is defaulted to false. If left as default, the plugin will trigger an AJAX GET and render the chart as soon as the data is received.
```
$(".sampleChart").highstockHelper({isLazy:true});

```

##Trigger events

for adding a single point
```
$(".sampleChartTarget").trigger("chart.addPoint", { data: [(new Date()).getTime(),50.70]});
```

**recreate** chart as a whole
```
$(".sampleChartTarget").trigger("chart.recreate");
```

and **destroy** instance
```
$(".sampleChartTarget").trigger("chart.destroy");
```
