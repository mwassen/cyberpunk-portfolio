/* ToDo
    -Add ability to modify existing Fx

    Observed:
    -Seems to be some kind of limiter that remains after Fx are cleared
*/

// import * as Tone from 'tone';

let Tone = require("tone");


module.exports = () => {
    let urls;
    let soundEngine = new Tone.Player({
            loop: true,
            autostart: true
        });
    // let active = false;
    // console.log(urls);

    let Fx = {
        rack: [],
        init: () => {
            soundEngine.disconnect();
            soundEngine.chain(...Fx.rack, Tone.Master);
        },
        // scrub: () => {
        //     Fx.rack = [];
        //     Fx.init();
        // },
        dist: (amount) => {
            Fx.rack.push(new Tone.Distortion(amount, "2x"));
            // console.log(Fx.rack);
            Fx.init();
        },
        // verb: (amount) => {
        //     Fx.rack.push(new Tone.Freeverb(amount, (Math.random() * 3000)));
        //     console.log(Fx.rack);
        //     Fx.init();
        // },
    };

    return {
        loadTape: (tape) => {
            urls = tape;
        },

        switchLoop: (loopNr) => {
            // soundEngine.autostart = true;
            soundEngine.load(urls[loopNr]);
    
            Fx.init();
        },

        play: () => {
            soundEngine.start();
        },

        stop: () => {
            soundEngine.stop();
        },

        addDist: (nr) => {
            Fx.dist(nr);
        },

        // addRev: () => {
        //     Fx.verb(0.1);
        // },
        // clearFx: () => {
        //     Fx.scrub();
        // },
        // status: () => {
        //     return soundEngine;
        // },
        changeSpeed: (value) => {
            soundEngine.playbackRate = value;
        },
        changeVolume: (value) => {
            soundEngine.volume.value = value;
        }
    }
}