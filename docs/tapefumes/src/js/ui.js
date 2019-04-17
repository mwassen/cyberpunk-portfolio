const PIXI = require("pixi.js");
const PIXIfilters = require("pixi-filters");
const mainjs = require("./main");
const playerFactory = require("./playerFactory");
const tapeFactory = require("./tapeFactory");
const toolFactory = require("./toolFactory");
const FontFaceObserver = require("fontfaceobserver");

module.exports = () => {
	let font = new FontFaceObserver("Press Start 2P");
	let tableSize = mainjs.mainState.table.size;

	// Button data
	// Todo: make this into a factory function??
	let buttons = [
		{
			text: "decks",
			pos: [],
			menu: null,
			menuSize: [200, 130],
			hover: null,
			sprite: null,
			// Adds ability to add/remove tapedecks from table
			populate: () => {
				// TODO - Add small buttons to the left-side of text

				// Create menu text items and add to array
				let addDeck = new PIXI.Text("add deck", {
					fontFamily: "Press Start 2P",
					fontSize: 8,
					fill: "white"
				});
				let removeDeck = new PIXI.Text("remove deck", {
					fontFamily: "Press Start 2P",
					fontSize: 8,
					fill: "white"
				});
				let resetTable = new PIXI.Text("reset table", {
					fontFamily: "Press Start 2P",
					fontSize: 8,
					fill: "white"
				});
				let btnArr = [addDeck, removeDeck, resetTable];

				// Make each item interactive and define common events
				btnArr.forEach((btn, ind) => {
					btn.position.set(30, 30 * (ind + 1));
					btn.interactive = true;
					btn.buttonMode = true;
					btn.hitArea = new PIXI.Rectangle(0, -10, 150, btn.height + 20);
					btn.mouseover = () => {
						btn.style.fill = 0xe25822;
					};
					btn.mouseout = () => {
						btn.style.fill = "white";
					};
					btn.mouseup = () => {
						btn.style.fill = 0xe25822;
					};
				});

				// Define unique events for each item
				addDeck.mousedown = () => {
					let deckArr = mainjs.mainState.decks.placed;

					addDeck.style.fill = "blue";
					// TODO add container that stores tapes behind the UI

					// Creates new player instance
					let newDeck = playerFactory();

					// Checks if there's enough space on the table for new deck
					if (mainjs.mainState.table.freePositions < 1) {
						// TODO - change console logging here to actual alerts
						console.log("no space on table");
						return;
					}

					// Initialises player and adds to main state
					newDeck.newPlayer();
					deckArr.push(newDeck);
				};

				removeDeck.mousedown = () => {
					let deckArr = mainjs.mainState.decks.placed;
					removeDeck.style.fill = "blue";

					// Checks if there's still more than one deck left on the table
					if (deckArr.length < 2) {
						// TODO - change console logging here to actual alerts
						console.log("can't have an empty table");
						return;
					}

					// Removes last player from main state array and runs delete function
					let deckObj = deckArr.splice(deckArr.length - 1, 1)[0];
					deckObj.delPlayer();
				};

				resetTable.mousedown = () => {
					resetTable.style.fill = "blue";
					location.reload();
				};

				// Returns array of items to builder function
				return btnArr;
			}
		},
		{
			text: "tapes",
			pos: [],
			menu: null,
			menuSize: [145, 330],
			hover: null,
			sprite: null,
			// Select from tape catalogue
			populate: () => {
				// TODO - Make tape menu sprites significantly bigger and add labels on hover

				// Create array with all available tapes
				let tapeFact = tapeFactory();
				let tapeArray = tapeFact.menuInit();

				let fullContainer = new PIXI.Container();

				// Create tape menu item for each tapeArray element
				tapeArray.forEach((cur, ind) => {
					let tapeBtn = new PIXI.Container();

					// Load attached tape sprite
					let sprite = cur.sprite;
					let name = new PIXI.Text(cur.name, {
						fontFamily: "Press Start 2P",
						fontSize: 8,
						fill: "white"
					});
					let tapeBg = new PIXI.Graphics();

					// Set tape space in advance
					sprite.scale.set(0.25);

					// Create selection bg for tape
					tapeBg.beginFill(0xe25822);
					tapeBg.drawRoundedRect(
						-2,
						-2,
						sprite.width + 4,
						sprite.height + 4,
						3
					);
					tapeBg.visible = false;

					// Anchor and place tape label
					name.anchor.set(0.5);
					name.position.set(sprite.width / 2, 80);

					// Add all elements to container
					tapeBtn.addChild(tapeBg);
					tapeBtn.addChild(sprite);
					tapeBtn.addChild(name);

					// Make container into a button
					tapeBtn.interactive = true;
					tapeBtn.buttonMode = true;
					tapeBtn.hitArea = new PIXI.Rectangle(
						0,
						0,
						tapeBtn.width,
						tapeBtn.height
					);
					tapeBtn.position.set(0, ind * (sprite.height + name.height + 30));

					// Add cursor events
					tapeBtn.mouseover = () => {
						tapeBg.visible = true;
						name.style.fill = 0xe25822;
					};

					tapeBtn.mouseout = () => {
						tapeBg.visible = false;
						name.style.fill = "white";
					};

					tapeBtn.mousedown = () => {
						clearHand();
						tapeFact.addToHand(cur);
					};

					fullContainer.addChild(tapeBtn);
				});

				// Offset entire tape menu
				fullContainer.position.set(20, 20);

				return [fullContainer];
			}
		},
		{
			text: "tools",
			pos: [],
			menu: null,
			menuSize: [115, 70],
			hover: null,
			sprite: null,
			// Select tools
			populate: () => {
				let toolFact = toolFactory();

				let toolArr = toolFact.initMenu();

				let fullContainer = new PIXI.Container();

				toolArr.forEach((cur, ind) => {
					let sprite = cur.sprite;
					let spriteBg = new PIXI.Sprite();
					let spriteCol = new PIXI.Container();
					let name = new PIXI.Text(cur.name, {
						fontFamily: "Press Start 2P",
						fontSize: 8,
						fill: "white"
					});
					let toolBtn = new PIXI.Container();

					spriteBg.texture = sprite.texture;
					// Size tool
					sprite.anchor.set(0.5);
					spriteBg.anchor.set(0.5);

					spriteBg.filters = [new PIXIfilters.OutlineFilter(2, 0xe25822)];
					spriteBg.visible = false;

					spriteCol.addChild(spriteBg);
					spriteCol.addChild(sprite);

					spriteCol.scale.set(0.5);
					spriteCol.position.set(spriteCol.width / 2, spriteCol.height / 2);

					// Place text
					name.anchor.set(0.5);
					name.position.set(sprite.width, spriteCol.height / 2);

					toolBtn.addChild(spriteCol);
					toolBtn.addChild(name);

					toolBtn.interactive = true;
					toolBtn.buttonMode = true;
					toolBtn.hitArea = new PIXI.Rectangle(
						0,
						0,
						toolBtn.width,
						toolBtn.height
					);

					toolBtn.mouseover = () => {
						spriteBg.visible = true;
						name.style.fill = 0xe25822;
					};

					toolBtn.mouseout = () => {
						spriteBg.visible = false;
						name.style.fill = "white";
					};

					toolBtn.mousedown = () => {
						clearHand();
						toolFact.addToHand(cur);
					};

					fullContainer.addChild(toolBtn);
				});

				fullContainer.position.set(10, 20);

				return [fullContainer];
			}
		},
		{
			text: "about",
			pos: [],
			menu: null,
			menuSize: [250, 200],
			hover: null,
			sprite: null,
			// Select from tape catalogue
			populate: () => {
				let fullContainer = new PIXI.Container();
				let soundsText = "sounds by:";
				let soundCreators = ["mswsn", "the conet project", "cns glo"];

				let soundsCont = new PIXI.Container();
				let soundsHeader = new PIXI.Text(soundsText, {
					fontFamily: "Press Start 2P",
					fontSize: 8,
					fill: "white"
				});
				soundsHeader.anchor.set(0.5);
				soundsHeader.position.set(125, 0);
				soundsCont.addChild(soundsHeader);

				soundCreators.forEach((el, ind) => {
					let curArtist = new PIXI.Text(el, {
						fontFamily: "Press Start 2P",
						fontSize: 8,
						fill: "white"
					});
					curArtist.anchor.set(0.5);
					curArtist.position.set(125, 20 + 15 * ind);
					soundsCont.addChild(curArtist);
				});

				soundsCont.position.set(0, 40);

				let aboutBody = "hammered together by:";
				let name = new PIXI.Text(aboutBody, {
					fontFamily: "Press Start 2P",
					fontSize: 8,
					fill: "white"
				});

				name.anchor.set(0.5);
				name.position.set(125, 140);

				let logoCont = new PIXI.Container();
				let pixelLogo = new PIXI.Sprite(mainjs.loadFromSheet["pixel-logo.png"]);
				let logoBg = new PIXI.Sprite();
				logoBg.texture = pixelLogo.texture;

				pixelLogo.scale.set(0.2);
				logoBg.scale.set(0.2);

				pixelLogo.anchor.set(0.5);
				logoBg.anchor.set(0.5);

				pixelLogo.position.set(125, 165);
				logoBg.position.set(125, 165);

				logoBg.filters = [new PIXIfilters.OutlineFilter(2, 0xe25822)];
				logoBg.visible = false;

				pixelLogo.interactive = true;
				pixelLogo.buttonMode = true;

				pixelLogo.mouseover = () => {
					logoBg.visible = true;
				};

				pixelLogo.mouseout = () => {
					logoBg.visible = false;
				};

				pixelLogo.mousedown = () => {
					window.open("../");
				};

				pixelLogo.mouseup = () => {
					logoBg.visible = false;
				};

				logoCont.addChild(logoBg);
				logoCont.addChild(pixelLogo);

				// name.anchor.set(0.5);
				// name.position.set(sprite.width, spriteCol.height / 2);

				fullContainer.addChild(soundsCont);
				fullContainer.addChild(name);
				fullContainer.addChild(logoCont);

				return [fullContainer];
			}
		}
	];

	function createBtns(btn, ind) {
		let textSprite = new PIXI.Text(btn.text, {
			fontFamily: "Press Start 2P",
			fontSize: 16,
			fill: "white"
		});

		// Calculate menu title positions based on tableSize
		btn.pos = [
			(window.innerWidth - tableSize[0]) / 2 + (15 + ind * 100),
			(window.innerHeight - tableSize[1]) / 2 / 2
		];
		textSprite.position.set(...btn.pos);

		// Make menu titles into buttons
		textSprite.interactive = true;
		textSprite.buttonMode = true;

		// Increases hit area to allow movement from title to menu body
		textSprite.hitArea = new PIXI.Rectangle(
			0,
			0,
			textSprite.width,
			textSprite.height + 10
		);

		// Cursor events
		textSprite.mouseup = () => {
			textSprite.style.fill = 0xe25822;
		};
		textSprite.mouseover = () => {
			btn.menu.visible = true;
			textSprite.style.fill = 0xe25822;
			if (mainjs.mainState.hand.active) {
				clearHand();
			}
		};
		textSprite.mouseout = () => {
			// hover state changes when cursor moves down to menu
			if (btn.hover == false) {
				btn.menu.visible = false;
				btn.sprite.style.fill = "white";
			}
		};

		// Add sprite to button object
		btn.sprite = textSprite;

		// Add text sprite to stage
		// mainjs.app.stage.addChild(textSprite);
		return textSprite;
	}

	function recordBtn() {
		let recordCont = new PIXI.Container();
		let redBtn = new PIXI.Sprite(mainjs.loadFromSheet["recordbtn.png"]);
		let redBg = new PIXI.Sprite();
		let recordingText = new PIXI.Text("recording", {
			fontFamily: "Press Start 2P",
			fontSize: 8,
			fill: "white"
		});

		redBg.texture = redBtn.texture;
		redBg.filters = [new PIXIfilters.OutlineFilter(3, 0xe25822)];
		redBg.visible = false;

		recordCont.addChild(redBg);
		recordCont.addChild(redBtn);
		recordCont.addChild(recordingText);

		recordingText.position.set(-80, 8);
		recordingText.visible = false;

		// Position at upper right of screen
		let btnPos = [
			window.innerWidth - (window.innerWidth - tableSize[0]) / 2 - 50,
			(window.innerHeight - tableSize[1]) / 2 / 2
		];
		recordCont.position.set(...btnPos);

		redBtn.scale.set(0.3);
		redBg.scale.set(0.3);

		// Declare as button
		redBtn.interactive = true;
		redBtn.buttonMode = true;

		let recording = false;
		let blinker;

		// Cursor events
		redBtn.mouseover = () => {
			redBg.visible = true;
		};
		redBtn.mouseout = () => {
			redBg.visible = false;
		};
		redBtn.mousedown = () => {
			if (recording) {
				mainjs.noise.stopRecord();
				recording = false;
				clearInterval(blinker);
				redBtn.alpha = 1;
				recordingText.visible = false;
			} else {
				mainjs.noise.startRecord();
				recording = true;
				recordingText.visible = true;
				blinker = setInterval(() => {
					if (redBtn.alpha) {
						redBtn.alpha = 0;
					} else {
						redBtn.alpha = 1;
					}
				}, 500);
			}
			// redBg.visible = false;
		};

		recordCont.addChild(redBtn);

		return recordCont;
	}

	function setupLogo() {
		let logoCont = new PIXI.Container();
		let firstRow = new PIXI.Text("tape", {
			fontFamily: "Press Start 2P",
			fontSize: 20,
			fill: "white"
		});
		let secondRow = new PIXI.Text("fumes", {
			fontFamily: "Press Start 2P",
			fontSize: 20,
			fill: "white"
		});

		firstRow.position.set(5, 0);
		secondRow.position.set(0, 20);

		logoCont.addChild(firstRow);
		logoCont.addChild(secondRow);

		// logoCont.anchor.set(0.5);

		logoCont.position.set(window.innerWidth / 2 - logoCont.width, 25);

		return logoCont;
	}

	function setup() {
		// Ensures font is loaded before rendering elements
		let buttonCont = new PIXI.Container();
		font.load().then(
			function() {
				buttons.forEach((btn, ind) => {
					buttonCont.addChild(createBtns(btn, ind));
				});
				buttonCont.addChild(recordBtn());
				if (window.innerWidth > 1100) buttonCont.addChild(setupLogo());
				mainjs.app.stage.addChild(buttonCont);
				setupMenus();
				initMenu();
				mainjs.app.stage.addChild(mainjs.mainState.hand.cont);
			},
			function() {
				// Logs issue but continues with default font
				console.log("Font is not available");
				buttons.forEach((btn, ind) => {
					buttonCont.addChild(createBtns(btn, ind));
				});
				buttonCont.addChild(recordBtn());
				if (window.innerWidth > 1100) buttonCont.addChild(setupLogo());
				mainjs.app.stage.addChild(buttonCont);
				setupMenus();
				initMenu();
				mainjs.app.stage.addChild(mainjs.mainState.hand.cont);
			}
		);
	}

	// Menus
	function menuBuilder(btn) {
		const curMenu = new PIXI.Container();

		// Create menu body background
		const menuBg = new PIXI.Graphics();
		menuBg.beginFill(0x000000);
		menuBg.fillAlpha = 0.75;
		menuBg.drawRect(0, 0, ...btn.menuSize);
		curMenu.addChild(menuBg);

		// Hides menu from view
		curMenu.visible = false;
		curMenu.interactive = true;

		// Populates menu with appropriate items
		btn.populate().forEach(cur => {
			curMenu.addChild(cur);
		});

		// Enables hovering between menu titles and body
		btn.hover = false;
		curMenu.mouseover = () => {
			btn.hover = true;
		};
		curMenu.mouseout = () => {
			btn.hover = false;

			// Hides entire menu and restores title on cursor exit
			curMenu.visible = false;
			btn.sprite.style.fill = "white";
		};

		// Position menu slightly lower than title
		curMenu.position.set(btn.pos[0], btn.pos[1] + 20);

		// Add menu to btn object
		btn.menu = curMenu;
	}

	function clearHand() {
		if (mainjs.mainState.hand.active) {
			mainjs.mainState.hand.tool = false;
			mainjs.mainState.hand.cont.removeChildren(0);
			mainjs.mainState.hand.active = false;
			mainjs.mainState.hand.item = null;
		}
	}

	// Why is this a seperate function?
	function setupMenus() {
		buttons.forEach(cur => {
			menuBuilder(cur);
		});
	}

	function initMenu() {
		let menuCont = new PIXI.Container();
		buttons.forEach(cur => {
			menuCont.addChild(cur.menu);
		});
		mainjs.app.stage.addChild(menuCont);
	}

	return {
		init: () => {
			setup();
		}
	};
};
