var blessed = require('blessed');

var screen = blessed.screen();

var box1 = blessed.box({
	width: '50%',
	height: '50%',
	content: '',
	tags: true,
	border: {
		type: 'line'
	},
	style: {
		fg: 'white',
		bg: 'magenta',
		border: {
			fg: '#f0f0f0'
		},
		hover: {
			bg: 'green'
		}
	}
});

var box2 = blessed.box({
	width: '50%',
	height: '50%',
	content: '',
	tags: true,
	border: {
		type: 'line'
	},
	style: {
		fg: 'white',
		bg: 'magenta',
		border: {
			fg: '#f0f0f0'
		},
		hover: {
			bg: 'green'
		}
	}
});

var box3 = blessed.box({
	width: '50%',
	height: '50%',
	content: '',
	tags: true,
	border: {
		type: 'line'
	},
	style: {
		fg: 'white',
		bg: 'magenta',
		border: {
			fg: '#f0f0f0'
		},
		hover: {
			bg: 'green'
		}
	}
});

var box4 = blessed.box({
	width: '50%',
	height: '50%',
	content: '',
	tags: true,
	border: {
		type: 'line'
	},
	style: {
		fg: 'white',
		bg: 'magenta',
		border: {
			fg: '#f0f0f0'
		},
		hover: {
			bg: 'green'
		}
	}
});

box1.position.top = 0;
box1.position.left = 0;

box2.position.top = 0;
box2.position.right = 0;

box3.position.bottom = 0;
box3.position.left = 0;

box4.position.bottom = 0;
box4.position.right = 0;

// Append our box to the screen.
screen.append(box1);

screen.append(box2);

screen.append(box3);

screen.append(box4);

// If our box is clicked, change the content.
box1.on('click', function(data) {
	box1.setContent('clicked');
	screen.render();
});

// If our box is clicked, change the content.
box2.on('click', function(data) {
	box2.setContent('clicked');
	screen.render();
});

// If our box is clicked, change the content.
box3.on('click', function(data) {
	box3.setContent('clicked');
	screen.render();
});

// If our box is clicked, change the content.
box4.on('click', function(data) {
	box4.setContent('clicked');
	screen.render();
});

// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
	return process.exit(0);
});

// Render the screen.
screen.render();