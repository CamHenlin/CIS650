var os = require('os');
var http = require('http');
var express = require('express');
var connect = require("connect");
var blessed = require('blessed');
var bodyParser = require('body-parser');
var app = express();

//app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

// Create a screen object.
var screen = blessed.screen();

// Create a box perfectly centered horizontally and vertically.
var box = blessed.box({
	top: 'center',
	left: 'center',
	width: '50%',
	height: '50%',
	content: '',
	tags: true,
	border: {
		type: 'line'
	},
	style: {
		fg: 'white',
		bg: 'black',
		border: {
			fg: '#f0f0f0'
		},
		hover: {
			bg: 'black'
		}
	}
});

// Append our box to the screen.
screen.append(box);

var my_job = parseInt(process.argv[2]);
// 0: a lock as in LOCK = (acquire -> release -> LOCK). and {a,b}::LOCK.
// 1: a variable that you can do a get to obtain current value and a post to set to new value.
// 2+: an incrementer. Gets lock, reads, increments, writes, release lock.


switch(my_job) {
	case 0:
		var lock = false;
		var lockIP = "";

		// handle GET requests
		app.get('/requestLock', function (req, res) {
			if (!lock) {
				lock = true;
				lockIP = req.connection.remoteAddress;
				res.json({"locked": true});

				box.setContent('{center}Handling locks. Locked.{/center}');
				screen.render();
			} else {
				res.json({"locked": false});
			}
		});

		// handle GET requests
		app.get('/releaseLock', function (req, res) {
			if (req.connection.remoteAddress === lockIP) {
				lock = false;
				lockIP = "";
				res.json({"unlocked": true});

				box.setContent('{center}Handling locks. Unlocked.{/center}');
				screen.render();
			} else {
				res.json({"unlocked": false});
			}
		});

		box.setContent('{center}Handling locks. Unlocked.{/center}');
		screen.render();
		break;

	case 1:
		var value = 0;

		// handle GET requests
		app.get('/getValue', function (req, res) {
			var the_body = req.query;
			var id = req.param(id);
			console.log ( "get body: " + the_body );
			box.setContent("Get with query: " + the_body);
			box.style.bg = 'green';	//green for get
			screen.render();
			res.json({"value": value});
		});

		// handle POST requests
		app.post('/setValue', function(req, res) {
			value++;

			box.setContent('{center}Handling value increments. Current value is '+value+'.{/center}');
			screen.render();
		});

		box.setContent('{center}Handling value increments. Current value is '+value+'.{/center}');
		screen.render();

		break;

	default:
		// interacts with PI-1, read/write controller
		var writeFunction = function(val) {
			var options = {
				host: '127.0.0.1', // will need to be changed if the lock system is running on another machine
				path: '/setValue',
				port: '3001',
				method: 'POST'
			};

			callback = function(response) {
				var str = ''
				response.on('data', function (chunk) {
					str += chunk;
				});

				response.on('end', function () {
					releaseFunction();
				});
			};

			var req = http.request(options, callback);

			req.write("");
			req.end();
		};

		// interacts with PI-1, read/write controller
		var readFunction = function(cb) {
			var options = {
				host: '127.0.0.1',
				port: '3001',
				path: '/getValue'
			};

			callback = function(response) {
				var str = '';
				response.on('data', function (chunk) {
					str += chunk;
				});

				response.on('end', function () {
					console.log('r:'+str);
					box.setContent('{center}Got lock and incrementing from.{/center}');
					screen.render();
				});
			};

			http.request(options, callback).end();
		};

		// interacts with PI-0, lock/unlock controller
		var lockFunction = function() {
			var options = {
				host: '127.0.0.1',
				port: '3000',
				path: '/requestLock'
			};

			callback = function(response) {
				var str = '';
				response.on('data', function (chunk) {
					str += chunk;
				});

				response.on('end', function () {
					if (JSON.parse(str).locked) {
						writeFunction();
					} else {
						lockFunction();
					}
				});
			};

			http.request(options, callback).end();
		};

		// interacts with PI-0, lock/unlock controller
		var releaseFunction = function() {
			var options = {
				host: '127.0.0.1',
				port: '3000',
				path: '/releaseLock'
			};

			callback = function(response) {
				var str = '';
				response.on('data', function (chunk) {
					str += chunk;
				});

				response.on('end', function () {
					// nothing to actually do once we've released our lock
				});
			};

			http.request(options, callback).end();
		};

		box.on('click', function(data) {
			lockFunction();
			box.setContent('{center}Attempting to lock and increment.{/center}');
			screen.render();
		});

		box.setContent('{center}I\'m the button.{/center}');
		screen.render();

		break;
}

app.set('port', process.env.PORT || 3000 + my_job);

// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
	return process.exit(0);
});

// Focus our element.
box.focus();

// Render the screen.
screen.render();

http.createServer(app).listen(app.get('port'), function() {
    console.log('Server up: http://localhost:' + app.get('port'));
});