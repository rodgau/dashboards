
var main = function() {
    $('.btn-primary').hide();
    $('.btn-default').hide();

    var msgCount=0;

   // Initialize our instances
    var pubnub = PUBNUB({
        subscribe_key: 'sub-c-16f65aa4-8b59-11e5-a7e4-0619f8945a4f', // always required
        publish_key: 'pub-c-35eccd6f-0c2d-4039-8953-765536e62b82',    // only required if publishing
        ssl : (('https:' == document.location.protocol) ? true : false)
    });
    var client = new Keen({
      projectId: "5645a4f790e4bd5b6a0739c2",
      readKey: "fa42307083bff8e6b5e8334e71e9d0bb151c09e383841db6814fc049dad78419074ad655dcc9174137d40243d3a113b5336b4a2fd534a6d5c89b616d61f1330da30c9a950be9fa4c7bdeddcdfd61d1283a4f5235abc86df8c966389bcd97910d5b16a1293032850c876db1c54ee3c3d6",
      protocol: "https"
    });

    // Subscribe to a channel
    pubnub.subscribe({
        channel: 'my_channel',
        message: function(m) {
            var s="";
            var x;
            msgCount++;
            for (x in m) {
                //text += person[x];
                s += x +": "+ m[x]+", ";
            }
            //$('#reading').text(m.sensor_1 +", "+m.sensor_2+"°C")
            $('#reading').text(s);
            $('#recStatus').text("Status: data received ("+msgCount+" total)");
        },
        error: function (error) {
          // Handle error here
          console.log(JSON.stringify(error));
        },
        connect: function() {
            $('.btn-primary').show();
            $('#recStatus').text("Status: waiting");
            $('#sendStatus').text("Status: ready");
        }
     });

    $('.btn-default').click(function() {
        client.run(querySensors, function(err, res){
            if (err) {
              // there was an error!
            }
            else {
              displayResult(res.result);
            }
        });
    });
    $('.btn-primary').click(function() {
        $('#sendStatus').text("Status: sending data...");
        pubnub.publish({
            channel: 'my_channel',
            message: { "sensor_1": 22.2, "sensor_2": 12.25 },
            callback : function(m){
                console.log(m);
                $('#sendStatus').text("Status: successful transmission");
            }
        });
    });

    var querySensors;
    Keen.ready(function(){

      // move this to proper location
      $('.btn-default').show();

      var interval = "minutely";
			var timeframe = "this_60_minutes";
			metric2Title = "Remote °C";
			metric3Title = "Board °C";
			chart1Title = "All Temperatures, °C (last hour)";
			chart2Title = "Remote Temperature, °C (last hour)";
			chart3Title = "Board Temperature, °C (last hour)";

      querySensors = new Keen.Query("select_unique", {
        eventCollection: "MM_temps",
        targetProperty: "_sensors",
        timeframe: "this_60_minutes",
        timezone: "UTC"
      });

			var keenEvents = new Keen.Query("count", {
				eventCollection: "MM_temps",
				timeframe: "this_1_months",
				timezone: "UTC"
			});
			var readingsHr = new Keen.Query("count", {
				eventCollection: "MM_temps",
				timeframe: "this_60_minutes",
				timezone: "UTC"
			});
			var remoteCurrent = new Keen.Query("average", {
				eventCollection: "MM_temps",
				targetProperty: "Office.temp",
				timeframe: "this_2_minutes", // NOTE:  using only 1 minute often returns no result (not sure why)
				timezone: "UTC"
			});
			var boardCurrent = new Keen.Query("average", {
				eventCollection: "MM_temps",
				targetProperty: "board.temp",
				timeframe: "this_2_minutes",
				timezone: "UTC"
			});
			var remote = new Keen.Query("average", {
				eventCollection: "MM_temps",
				interval: interval,
				targetProperty: "Office.temp",
				timeframe: timeframe,
				timezone: "UTC"
			});
			var board = new Keen.Query("average", {
				eventCollection: "MM_temps",
				interval: interval,
				targetProperty: "board.temp",
				timeframe: timeframe,
				timezone: "UTC"
			});

			var chartMetric1 = new Keen.Dataviz()
				.el(document.getElementById("chart-metric1"))
				.chartType("metric");
			var chartLine1 = new Keen.Dataviz()
				.el(document.getElementById("chart-line1"))
				.chartType("linechart");
			var chartLine2 = new Keen.Dataviz()
				.el(document.getElementById("chart-line2"))
				.chartType("linechart");
			var chartMetric2 = new Keen.Dataviz()
				.el(document.getElementById("chart-metric2"))
				.chartType("metric");
			var chartLine3 = new Keen.Dataviz()
				.el(document.getElementById("chart-line3"))
				.chartType("linechart");
			var chartMetric3 = new Keen.Dataviz()
				.el(document.getElementById("chart-metric3"))
				.chartType("metric");
			var chartMetric4 = new Keen.Dataviz()
				.el(document.getElementById("chart-metric4"))
				.chartType("metric");
  		//chart.attributes used for keen's chart settings (over-rides Google API)
  		chartLine1.attributes({
  				title: chart1Title,
  				titlePosition: 'out',
  				titleTextStyle: {
  						color: 'black',
  						fontSize: 20
  				}
  		});
  		chartLine2.attributes({
  				title: chart2Title,
  				//width: 900,
  				//height: 450,
  				titlePosition: 'out',
  				titleTextStyle: {
  						color: 'black',
  						fontSize: 20
  				}
  		});
  		chartLine3.attributes({
  				title: chart3Title,
  				//width: 900,
  				//height: 450,
  				titlePosition: 'out',
  				titleTextStyle: {
  						color: 'black',
  						fontSize: 20
  				}
  		});
  		chartMetric1.attributes({
  				title: "readings/hr",
  			colors: ['#A9A9A9']
  		});
  		chartMetric2.attributes({
  				title: metric2Title,
  				colors: ['red']
  		});
  		chartMetric3.attributes({
  				title: metric3Title,
  				colors: ['green']
  		});
  		chartMetric4.attributes({
  				title: "Events Total",
  				colors: ['#4B4B4B']
  		});

  		//chart.chartOptions passes args directly to Google Charts API (or C3/Charts.js)
  		chartLine1.chartOptions({
  				vAxis: {
  						minValue: 20,
  			maxValue: 45,
  						minorGridlines: {
  								count: 5
  						}
  				},
  				explorer: {
  						actions: ['dragToZoom', 'rightClickToReset']
  				}
  		});
  		chartLine2.chartOptions({
  				vAxis: {
  						minValue: 20,
  			maxValue: 45,
  						minorGridlines: {
  								count: 5
  						}
  				},
  				explorer: {
  						actions: ['dragToZoom', 'rightClickToReset']
  				}
  		});
  		chartLine3.chartOptions({
  				vAxis: {
  						minValue: 20,
  			maxValue: 45,
  						minorGridlines: {
  								count: 5
  						}
  				},
  				explorer: {
  						actions: ['dragToZoom', 'rightClickToReset']
  				}
  		});
  		// start spinners
  		chartMetric1.prepare();
  		chartLine1.prepare();
  		chartLine2.prepare();
  		chartMetric2.prepare();
  		chartLine3.prepare();
  		chartMetric3.prepare();
  		chartMetric4.prepare();
   		var req0b = client.run(readingsHr, function(err, res){
  			if (err) {
  				// Display the API error
  				chartMetric1.error(err.message);
  			}
  			else {
  				// Handle the response
  				chartMetric1
  					.parseRequest(this)
  					.render();
  			}
  		});
  		var req1 = client.run(remote, function(err, res){
  			if (err) {
  				// Display the API error
  				chartLine2.error(err.message);
  			}
  			else {
  				// Handle the response
  				chartLine2
  					.parseRequest(this)
  					.render();
  			}
  		});
  		var req1b = client.run(remoteCurrent, function(err, res){
  			if (err) {
  				// Display the API error
  				chartMetric2.error(err.message);
  			}
  			else {
  				// Handle the response
  				chartMetric2
  					.parseRequest(this)
  					.render();
  			}
  		});
  		var req2 = client.run(board, function(err, res){
  			if (err) {
  				// Display the API error
  				chartLine3.error(err.message);
  			}
  			else {
  				// Handle the response
  				chartLine3
  					.parseRequest(this)
  					.render();
  			}
  		});
  		var req2b = client.run(boardCurrent, function(err, res){
  			if (err) {
  				// Display the API error
  				chartMetric3.error(err.message);
  			}
  			else {
  				// Handle the response
  				chartMetric3
  					.parseRequest(this)
  					.render();
  			}
  		});
  		var req3b = client.run(keenEvents, function(err, res){
  			if (err) {
  				// Display the API error
  				chartMetric4.error(err.message);
  			}
  			else {
  				// Handle the response
  				chartMetric4
  					.parseRequest(this)
  					.render();
  			}
  		});
  		// handle our combined line graph a bit differently
  		var req0 = client.run([remote, board], function(err, res){ // run the 2 queries
  			if (err) {
  				// Display the API error
  				chartLine1.error(err.message);
  			}
  			else {
  				// Handle the response
  				var result1 = res[0].result // data from first query
  				var result2 = res[1].result // data from second query
  				var data =[] // place for combined results
  				var i = 0

  				while (i < result1.length) {

  					data[i]={ // format the data so it can be charted
  							timeframe: result1[i]["timeframe"],
  							value: [
  									{ category: "Remote °C", result: result1[i]["value"] },
  									{ category: "board °C", result: result2[i]["value"] }
  							]
  					}
  					if (i == result1.length-1) { // chart the data
  					chartLine1
  						.parseRawData({ result: data })
  						//.title("Remote & board Sensor Temps (30 second auto-updates)")
  						.render();
  					}
  					i++;
  				}
  			}
  		});
  		// Re-run and refresh every half minute...
  		setInterval(function() {
  			req0b.refresh();
  			req0.refresh();
  			req1.refresh();
  			req1b.refresh();
  			req2.refresh();
  			req2b.refresh();
  			req3b.refresh();
  		}, 1000 * 60 * 0.5);

    }); //--- end keen.ready()

    function displayResult(data) {
        var total = [];
    	for ( var index1 in data )
    		for ( var index2 in data[index1] )
    		    if ( total.indexOf(data[index1][index2])  == -1 )
    			//if ( !( stringInArray( data[index1][index2], total ) ) )
    			    // unique sensor found, add it to our list
    				total.push ( data[index1][index2] );
    	if ( !total.length )
    	    console.log("No sensor data for period.");
    	else
    	    console.log ("These sensors are available: " + total);
    	$('#sensorList').text("Available Sensors: [" + total + "]");

    }
};

$(document).ready(main);
