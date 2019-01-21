let PIXI = require("pixi.js");
let PIXIfilters = require("pixi-filters");

let app = new PIXI.Application({
	width: window.innerWidth,
	height: window.innerHeight,
	antialiasing: false,
	transparent: true,
	resolution: 1
});

let state;
let counter = 0;
let outlines = new PIXI.Container();

document.body.appendChild(app.view);

PIXI.loader
	.add("./src/img/logo.png")
	.add("./src/img/logow.png")
	.load(setup);

function setup() {
	let logo = new PIXI.Sprite(PIXI.loader.resources["./src/img/logo.png"].texture);

	logo.scale.set(0.3);
	logo.anchor.set(0.5);
	logo.position.set(window.innerWidth / 2, window.innerHeight / 2);

	app.stage.addChild(outlines);
	app.stage.addChild(logo);

	

	state = play;

	app.ticker.add(delta => gameLoop(delta));
};

function gameLoop(delta) {
	state(delta);
};

function play() {
	if (counter % 20 === 0) {
		let outlineinstance = new PIXI.Sprite(PIXI.loader.resources["./src/img/logo.png"].texture)
		outlineinstance.scale.set(0.3);
		outlineinstance.anchor.set(0.5);
		outlineinstance.position.set(window.innerWidth / 2, window.innerHeight / 2);

		outlines.addChild(outlineinstance);
	}

	outlines.children.forEach(element => {
		element.scale.set(element.scale.y + 0.001);

	});

	if (outlines.children.length > 3) {
		outlines.removeChildAt(0);
		
	}

	counter++;
}