
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
        
      querySensors = new Keen.Query("select_unique", {
        eventCollection: "MM_temps",
        targetProperty: "_sensors",
        timeframe: "this_60_minutes",
        timezone: "UTC"
      });
      $('.btn-default').show();
      
    }); //--- end keen.ready()
    
    function stringInArray ( one, two ) {
		for (var elem in two) {
		    console.log("elem: ["+two[elem]+"]");
			if ( one == two[elem] )
				return true;
		}
		return false;
    }
    function test() {
        var a = 'aple';
        var b = ["pig", "house", "apple"];
        if ( stringInArray( a, b) )
            console.log ("a: "+a + " is in b: "+ b);
        else
            console.log ("a: "+a + " not found in b: "+ b);
    }
    
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
