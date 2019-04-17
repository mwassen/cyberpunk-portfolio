/* ToDo
    -Add ability to modify existing Fx

    Observed:
    -Seems to be some kind of limiter that remains after Fx are cleared
*/

// import * as Tone from 'tone';

let Tone = require("tone");


module.exports = () => {

    let actx = Tone.context;
    let dest = actx.createMediaStreamDestination();
    let recorder = new MediaRecorder(dest.stream);

    Tone.Master.connect(dest);

    let chunks = [];

    recorder.ondataavailable = evt => {
        chunks.push(evt.data);
    }

    recorder.onstop = evt => {
        let blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });

        // Setup and format current date + time
        let today = new Date();
        let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

        // create link and start download - Adapted from https://jsfiddle.net/koldev/cW7W5/
        let a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        let url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = "tape fumes - " + date + " " + time + ".ogg";
        a.click();
        window.URL.revokeObjectURL(url);
    }


    return {
        newPlayer: () => {
            let curPlayer = new Tone.Player({
                loop: true,
                autostart : true
            });

            let Fx = {
                rack: [],
                init: () => {
                    curPlayer.disconnect();
                    curPlayer.chain(...Fx.rack, Tone.Master);
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
            }



            // Add tone player inside here?
            return {
                loadTape: (tape) => {
                    urls = tape;
                },
        
                switchLoop: (loopNr) => {
                    // curPlayer.autostart = true;
                    curPlayer.load(urls[loopNr]);
            
                    Fx.init();
                },
        
                play: () => {
                    curPlayer.start();
                },
        
                stop: () => {
                    curPlayer.stop();
                },
        
                addDist: (nr) => {
                    Fx.dist(nr);
                },

                changeSpeed: (value) => {
                    curPlayer.playbackRate = value;
                },
                changeVolume: (value) => {
                    curPlayer.volume.value = value;
                }
            }
        },
        startRecord: () => {
            recorder.start();
        },
        stopRecord: () => {
            recorder.stop();
        }
        
    }
}