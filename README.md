# HighstockHelper code
## Chart builder
**Info to come**

## jQuery wrapper plugin
jQuery wrapper plugin to make highstock chart creation quicker

## Sample use
```
<div id="specialChart"
     class="sampleChart"
     data-feed-url="jsonsample.json"
     data-live-update="true"
     data-title="Spot Prices per oz"
     data-series-name="oz"></div>
```

##Trigger events

for adding a single point
```
$(".sampleChart").trigger("chart.addPoint", { data: ["red",34.70]});
```

**recreate** chart as a whole
```
$("#specialChart").trigger("chart.recreate");
```

and **destroy** instance
```
$(".kjcChart").trigger("chart.destroy");
```
