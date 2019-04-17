const PIXI = require("pixi.js");
const PIXIfilters = require("pixi-filters");
const mainjs = require("./main.js");
const playerFactory = require("./playerFactory");
const SimplexNoise = require("simplex-noise");

module.exports = (toolId) => {

    // Range conversion
    function convertRange( value, r1, r2 ) { 
        return ( value - r1[ 0 ] ) * ( r2[ 1 ] - r2[ 0 ] ) / ( r1[ 1 ] - r1[ 0 ] ) + r2[ 0 ];
    };

    // Function for creating gashes between two positions
    // function gashDrawer(x1, y1, x2, y2) {
    //     // Define slope
    //     let m = (y2 - y1) / (x2 - x1);
    //     // Define offset
    //     let b = -(x1 * m - y1);
    //     // Define length
    //     let vecLength = Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));

    //     // Calculate amount of iterations based on length
    //     let iterations = Math.floor(vecLength);
    //     let iterB = (x2 - x1) / iterations;

    //     let simplex = new SimplexNoise();

    //     // let halfWay = (x1 > x2) ? x1 + Math.abs(x1 - x2) / 2 : x1 + Math.abs(x2 - x1) / 2;
    //     let halfWay = x1 + Math.abs(x1 - x2) / 2

    //     let gashCont = new PIXI.Graphics();
    //     gashCont.beginFill(0x000000);

    //     for (let i = x1; i <= x2; i += iterB) {
            
    //         let y = m * i + b;

    //         let simplexCur = simplex.noise2D(i, y) * 20;

    //         let thickness = 3 - ((Math.abs(halfWay - i)) / 5)


    //         gashCont.drawRect(i + simplexCur, y + simplexCur, thickness, thickness)
    //     }

    //     // gashCont.filters = [new PIXIfilters.EmbossFilter()]

    //     return gashCont;

    // }

    function fireDrawer() {
        let fireSprite = new PIXI.Sprite();
        let fireFrames = [];
        let frame = Math.floor(Math.random() * 4);

        for (let i = 0; i < 4; i++) {
            fireFrames.push(new PIXI.Texture.from(mainjs.loadFromSheet["fire" + (i + 1) + ".png"]))
        }

        setInterval(() => {
            fireSprite.texture = fireFrames[frame];
            frame++;
            if(frame >= 4) {
                frame = 0;
            }
        }, 75);

        return fireSprite;
    }

    // Ticker for tool animations & flames
    let toolTicker = new PIXI.ticker.Ticker;

    const toolsDb = [
        {
            name: "hammer",
            use: () => {
                return (deckCont, player, sprite) => {

                    // Create containers and new hammer sprite
                    let hitGroup = new PIXI.Container();
                    let hammerMeter = new PIXI.Container();
                    let hammerMeterBg = new PIXI.Sprite(mainjs.loadFromSheet["hammer-meter.png"]);

                    // Indicator for hammer strength meter
                    let hammerMeterInd = new PIXI.Graphics();
                    hammerMeterInd.beginFill(0x000000);
                    hammerMeterInd.drawRect(0, 125, 15, 3);

                    // Add graphics and sprite to hammer meter
                    hammerMeter.addChild(hammerMeterBg);
                    hammerMeter.addChild(hammerMeterInd);

                    // Position hammer sprite
                    sprite.anchor.set(0.55, 0.7);
                    sprite.position.set(0, 100);
                    sprite.rotation = Math.PI * 0.15;

                    // Add hammer + meter to container
                    hitGroup.addChild(hammerMeter);
                    hitGroup.addChild(sprite);

                    // Set original alpha to 0, for animating entry later
                    hitGroup.alpha = 0;

                    // Position meter next to hammer
                    hammerMeter.position.set(50, 10);
                    hammerMeter.rotation = Math.PI * 0.09;

                    // Position entire group
                    hitGroup.position.set(140, -100);
                    hitGroup.rotation = Math.PI * 0.03;

                    // Store direction and speed of meter indicator
                    let dirUp = true;
                    let indSpeed = 3;

                    // Adds meter indicator animation to ticker, up & down
                    toolTicker.add((delta) => {
                        if (dirUp == true) {
                            hammerMeterInd.position.y -= indSpeed;
                        } else {
                            hammerMeterInd.position.y += indSpeed;
                        }

                        if (hammerMeterInd.position.y < -123) {
                            dirUp = false;
                        } else if (hammerMeterInd.position.y > -1) {
                            dirUp = true;
                        }
                    })

                    toolTicker.start();

                    // New function for next click on deck container
                    let newDown = () => {
                        // Remove meter and stop ticker
                        hitGroup.removeChild(hammerMeter);
                        toolTicker.stop();

                        // Calculate hit strength based on indicator position at click
                        let amount = convertRange(hammerMeterInd.position.y, [0, -124], [0, 1]);
                        let damage = amount * 33;

                        // Calculate HP for current player
                        deckCont.healthPoints -= damage;

                        // Play swing sound at varying volume
                        mainjs.sounds.swing._volume = amount;
                        mainjs.sounds.swing.play();

                        // Animate hammer swing
                        for(let i = 0; i <= 10; i++) {
                            // Animates hammer rotation, simulating hit
                            setTimeout(() => {
                                // Recede before striking tape
                                if (i < 2) {
                                    sprite.rotation += Math.PI * 0.06;
                                } else {
                                    sprite.rotation -= Math.PI * 0.085;
                                }

                                if (i == 10) {

                                    // Plays bang and adds distortion according to strength
                                    mainjs.sounds.bang._volume = amount;
                                    mainjs.sounds.bang.play();
                                    player.addDist(amount);

                                    // console.log(deckCont.children);
                                    // deckCont.removeChildAt(5);

                                    // Animates hit impact and fade out
                                    for(let j = 0; j <= 15; j++) {
                                        setTimeout(() => {
                                            if (j < 4) {
                                                let hitCircle = new PIXI.Graphics();
                                                hitCircle.beginFill(0xffffff);
                                                hitCircle.drawCircle(-125, 160, (20 * j) + (amount * 20));
                                                hitCircle.alpha = amount * 0.3;
                                                hitGroup.addChildAt(hitCircle, 0);
                                            } else {
                                                hitGroup.alpha -= 0.1;
                                            }

                                            // Removes group at end
                                            if (j == 15) {
                                                deckCont.removeChild(hitGroup);
                                            }
                                        }, 50 * j);
                                    }

                                    deckCont.children[0].children[3].removeChildren();

                                    for (let i = 0; i < (100 - deckCont.healthPoints); i += 25) {
                                        let newFire = fireDrawer();
                                        newFire.scale.set(0.75);
                                        newFire.anchor.set(0.5);
                                        newFire.position.set(((Math.random() - 0.5) * (deckCont.width / 4)), ((Math.random() - 0.5) * (deckCont.height / 4)));
    
    
                                        deckCont.children[0].children[3].addChild(newFire);
                                    }



                                    





                                    // // Draws gashes onto speaker grill
                                    // let internals = deckCont.children[0].children[2].children[0];
                                    // let newGash = gashDrawer(-20, -100, 0, -70);
                                    // if(internals.parent.children.length > 2) {
                                    //     internals.mask = null;
                                    //     internals.parent.removeChildAt(2);
                                    // }

                                    // internals.mask = newGash;
                                    // internals.parent.addChild(newGash);

                                    // internals.filters = [new PIXIfilters.OutlineFilter(2, 0x000000)];

                                    // internals.visible = true;


                                    // // Adds displacement map to deck body, simulating damage
                                    // let displaceMap = new PIXI.Sprite(mainjs.loadFromSheet["displace.png"]);
                                    // displaceMap.anchor.set(0);
                                    // displaceMap.scale.set(3, 3);
                                    // // displaceMap.rotation = Math.random()

                                    // console.log(deckCont.children[0].filters)
                                    // if (deckCont.children[0].filters){
                                    //     deckCont.children[0].removeChild(displaceMap);
                                    //     deckCont.children[0].filters.push(new PIXI.filters.DisplacementFilter(displaceMap));
                                    //     console.log("suckaaaa");
                                    // } else {
                                    //     deckCont.children[0].filters = [new PIXI.filters.DisplacementFilter(displaceMap)];
                                    // }

                                    // mainjs.app.stage.addChild(displaceMap);
                                }
                            // Increases animation acceleration according to hit
                            }, ((30 - (i * amount * 1.5)) * i));

                            
                        };

                    }                        

                    deckCont.addChild(hitGroup);

                    // Fades hitgroup in
                    for(let i = 0; i <= 5; i++) {
                        setTimeout(() => {
                            hitGroup.alpha += 0.2;
                        }, 50 * i);
                    }

                    return newDown;
                }
            }
            
        }
    ];

    // Draws tools onto menu
    function menuDraw() {
        let toolsArr = [];
        toolsDb.forEach((cur, ind) => {
            toolsArr[ind] = {
                name: cur.name,
                sprite: new PIXI.Sprite(mainjs.loadFromSheet["menu-" + cur.name + ".png"]),
                inHand: new PIXI.Sprite(mainjs.loadFromSheet["hand-" + cur.name + "1.png"]),
                apply: cur.use
            }
        });
        return toolsArr;
    };

    // Adds tool to hand
    function equip(tool) {
        tool.inHand.scale.set(0.75);

        mainjs.mainState.hand.cont.addChild(tool.inHand);

        mainjs.mainState.hand.tool = true;
        mainjs.mainState.hand.active = true;
        mainjs.mainState.hand.data = tool.apply;
    };

    return {
        initMenu: () => {
            return menuDraw();
        },
        addToHand: (tool) => {
            equip(tool);
        }

    }
}