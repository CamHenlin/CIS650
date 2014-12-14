var os = require('os');
var http = require('http');
var express = require('express');
var app = express();
app.set('port', process.env.PORT || 3000);

var ifaces = os.networkInterfaces();
var my_ip = "";
var nodes = [];

// find our own ip address:
for (var dev in ifaces) {
	if (dev !== 'en1') { // may need to modify to be eth0 or wlan0 on the rpi, en1 is for wifi on a macintosh
		continue;
	}
	var alias = 0;
	ifaces[dev].forEach(function(details) {
		if (details.family=='IPv4') {
			console.log(dev + (alias? ':' + alias: ''), details.address);
			++alias;

			my_ip = details.address;
		}
	});
}

var lan = my_ip.match(/[0-255]+\.[0-255]+\.[0-255]+./);
console.log('this node (' + my_ip + ') will attempt to send its token to other nodes on network: ' + lan + "xxx" + ":" + app.get('port'));

/**
 * [description]
 * @param  {[type]} req  [description]
 * @param  {[type]} res) {	res.write(JSON.stringify({ response: true })); 	res.end();} [description]
 * @return {[type]}      [description]
 */
app.get('/is_node', function(req, res) {
	res.write(JSON.stringify({ response: true })); // could be anything, even just an OK response
	res.end();
});

/**
 * [description]
 * @param  {[type]} req  [description]
 * @param  {[type]} res) {	var        token [description]
 * @return {[type]}      [description]
 */
app.get('/transmit_token/:token', function(req, res) {
	var token = req.param('token');
	res.write("token received"); // could be anything, even just an OK response
	res.end();

	for (var i = 1; i < 255; i++) {
		if (lan + i === my_ip) { // skip our own ip address
			continue;
		}

		// sending these requests off in anonymous functions forces the response handlers to be in the correct
		// context for i. otherwise responses will almost always be assumed to be for i = 254
		(function () {
			var my_i = i;

			var options = {
				host: lan + my_i,
				port: app.get('port'), // use our default port
				path: '/is_node'
			};

			var req = http.get(options, function(res) {
				var bodydata = [];
				res.on('data', function(data) {
					bodydata.push(data);
				}).on('end', function() {
					var body = Buffer.concat(bodydata);
					body = JSON.parse(body);
					if (body.response) {
						// push this i value to the node list
						nodes.push(my_i);
					}
				});
			});

			// fill in socket and error handlers as necessary:
			req.on('socket', function (socket) {
				socket.setTimeout(100);
				socket.on('timeout', function() {
					req.abort();
				});
			});

			req.on('error', function(e) {});

		})();
	}

	// wait 5 seconds then pass our token to some other random node:
	setTimeout(function() {
		if (!nodes.length) {
			console.log('no nodes to transmit token to!');
			return;
		}

		var target = Math.floor(Math.random() * nodes.length);

		var options = {
			host: lan + target,
			port: app.get('port'), // use our default port
			path: '/trasnmit_token/' + token
		};

		var req = http.get(options, function(res) {
			var bodydata = [];
			res.on('data', function(data) {
				bodydata.push(data);
			}).on('end', function() {
				var body = Buffer.concat(bodydata);

				// we now have a body object, should be "token received"
			});
		});

		// fill in socket and error handlers as necessary:
		req.on('socket', function (socket) {
			socket.setTimeout(100);
			socket.on('timeout', function() {
				req.abort();
			});
		});

		req.on('error', function(e) {});
	}, 5000);
});

/**
 * [description]
 * @param  {[type]} ) {	console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));} [description]
 * @return {[type]}   [description]
 */
app.listen(app.get('port'), function() {
	console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;