// IMPORTS

// THREE stuff - split for tree shaking
import { Scene } from "three-full/sources/scenes/Scene";
import { OrthographicCamera } from "three-full/sources/cameras/OrthographicCamera";
import { WebGLRenderer } from "three-full/sources/renderers/WebGLRenderer";
import { RawShaderMaterial } from "three-full/sources/materials/RawShaderMaterial";
import { Vector2 } from "three-full/sources/math/Vector2";
import { Vector3 } from "three-full/sources/math/Vector3";
import { WebGL } from "three-full/sources/helpers/WebGL";
import { RenderPass } from "three-full/sources/postprocessing/RenderPass";
import { ShaderPass } from "three-full/sources/postprocessing/ShaderPass";
import { GlitchPass } from "three-full/sources/postprocessing/GlitchPass";
import { UnrealBloomPass } from "three-full/sources/postprocessing/UnrealBloomPass";
import { EffectComposer } from "three-full/sources/postprocessing/EffectComposer";
import { FXAAShader } from "three-full/sources/shaders/FXAAShader";
import { GLTFLoader } from "three-full/sources/loaders/GLTFLoader";

// Dev Stuff
import * as dat from "dat.gui";
import Stats from "stats-js";

// CSS
import "../css/main.css";

// 3D Model
import logo3d from "../assets/mswsn3d.glb";

// Own Shaders
import vShader from "../shaders/vertex1.glsl";
import fShader from "../shaders/fragment1.glsl";

if (WebGL.isWebGLAvailable() === false) {
  document.body.appendChild(WebGL.getWebGLErrorMessage());
}

// SETUP
const scene = new Scene();
const camera = new OrthographicCamera();
const renderer = new WebGLRenderer({ alpha: true });

// Window sizing
let width = window.innerWidth;
let height = window.innerHeight;

let aspectRatio = width / height;
console.log(aspectRatio);

// DOM references
const scrollSvg = document.getElementById("scroll-down");
const contentBg = document.getElementById("bg");
const writtenContent = document.getElementById("main-container");

// const accelerometer = new Accelerometer({ frequency: 60 });

// accelerometer.addEventListener("reading", e => {
//   console.log("Acceleration along the X-axis " + accelerometer.x);
//   console.log("Acceleration along the Y-axis " + accelerometer.y);
//   console.log("Acceleration along the Z-axis " + accelerometer.z);
// });
// accelerometer.start();

// State for use in GUI and application
const state = {
  cZoom: 1,
  bloom: {
    exposure: 1,
    bloomStrength: 1.5,
    bloomThreshold: 0,
    bloomRadius: 0.15
  },
  glitch: {
    on: true,
    goWild: true
  }
};

var renderPass = new RenderPass(scene, camera);

let statsWidget = null;

// GUI, only enabled in development
if (process.env.NODE_ENV === "development") {
  const gui = new dat.GUI();
  gui.add(state, "cZoom", 0.01, 5, 0.0001).onChange(updateScene);
  gui.add(state.bloom, "exposure", 0.1, 2).onChange(function(value) {
    renderer.toneMappingExposure = Math.pow(value, 4.0);
  });
  gui.add(state.bloom, "bloomThreshold", 0.0, 1.0).onChange(function(value) {
    bloomPass.threshold = Number(value);
  });
  gui.add(state.bloom, "bloomStrength", 0.0, 3.0).onChange(function(value) {
    bloomPass.strength = Number(value);
  });
  gui
    .add(state.bloom, "bloomRadius", 0.0, 1.0)
    .step(0.01)
    .onChange(function(value) {
      bloomPass.radius = Number(value);
    });

  gui.closed = true;

  statsWidget = new Stats();
  statsWidget.showPanel(0);
  document.body.appendChild(statsWidget.dom);
}

// // LIGHTS
// const light1 = new THREE.AmbientLight(0xffffff, 0.7);
// scene.add(light1);

// const light2 = new THREE.PointLight(0xffffff, 0.5);
// scene.add(light2);
// light2.lookAt(new THREE.Vector3());

let logoMesh;

// SHADERS
const myShader = new RawShaderMaterial({
  uniforms: {
    time: { value: 1.0 },
    scroll: { value: 0.0 },
    resolution: { value: new Vector2() }
  },

  vertexShader: vShader,
  fragmentShader: fShader
});

// EFFECTS
const bloomPass = new UnrealBloomPass(
  new Vector2(width, height),
  1.5,
  0.4,
  0.85
);

bloomPass.renderToScreen = false;
bloomPass.threshold = state.bloom.bloomThreshold;
bloomPass.strength = state.bloom.bloomStrength;
bloomPass.radius = state.bloom.bloomRadius;

const glitchPass = new GlitchPass();
glitchPass.renderToScreen = false;

// console.log(glitchPass);

// const ssaoPass = new SSAOPass(
//   scene,
//   camera,
//   window.innerWidth,
//   window.innerHeight
// );
// ssaoPass.kernelRadius = 16;
// ssaoPass.renderToScreen = false;

const fxaaPass = new ShaderPass(FXAAShader);
fxaaPass.renderToScreen = true;

const pixelRatio = renderer.getPixelRatio();
const uniforms = fxaaPass.material.uniforms;

uniforms["resolution"].value.x = 1 / (width * pixelRatio);
uniforms["resolution"].value.y = 1 / (height * pixelRatio);

const composer = new EffectComposer(renderer);
composer.setSize(width, height);
composer.addPass(renderPass);
composer.addPass(bloomPass);
composer.addPass(glitchPass);
composer.addPass(fxaaPass);

// EVENTS
window.addEventListener("resize", updateScene);
window.addEventListener("scroll", updateCamera);

document.getElementById("three").appendChild(renderer.domElement);

updateScene();

// MODELS
const loader = new GLTFLoader();
loader.load(
  logo3d,
  gltf => {
    logoMesh = gltf.scene.children[0];
    logoMesh.material = myShader;
    logoMesh.scale.set(70, 70, 70);
    scene.add(logoMesh);
    glitchPass.goWild = state.glitch.goWild;
  },
  function(xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  error => {
    console.log(error);
  }
);

let frame = 0;
function animate() {
  if (process.env.NODE_ENV === "development") {
    statsWidget.begin();
  }
  requestAnimationFrame(animate);

  // Hover animations on model
  if (logoMesh) {
    // logoMesh.rotation.x = Math.sin(frame / 100);
    // logoMesh.rotation.z = Math.sin(frame / 50);
    logoMesh.rotation.x = Math.sin(frame / 100) / 10 - 100;
    logoMesh.rotation.y = Math.sin(frame / 300) / 10;
    logoMesh.position.set(0, Math.sin(frame / 40) / 75, 0);
  }
  // Initial glitch
  if (frame == 75) {
    glitchPass.goWild = false;
    if (window.scrollY != 0) glitchPass.enabled = false;
  } else if (frame == 150 && window.scrollY == 0) scrollSvg.style.opacity = 1;

  myShader.uniforms.time.value += 0.1;
  frame++;
  composer.render();
  if (process.env.NODE_ENV === "development") {
    statsWidget.end();
  }
}

// updateCamera();
animate();

function updateScene() {
  width = window.innerWidth;
  height = window.innerHeight;
  const aspect = width / height;

  // Ortho zoom
  const zoom = state.cZoom;

  // Bounds
  camera.left = -zoom * aspect;
  camera.right = zoom * aspect;
  camera.top = zoom;
  camera.bottom = -zoom;

  // Near/Far
  camera.near = -100;
  camera.far = 100;

  // Set position & look at world center
  camera.position.set(zoom, zoom, zoom);
  camera.lookAt(new Vector3());

  // Update the camera
  renderer.setSize(width, height);
  composer.setSize(width, height);

  camera.updateProjectionMatrix();

  const pixelRatio = renderer.getPixelRatio();
  fxaaPass.material.uniforms["resolution"].value.x = 1 / (width * pixelRatio);
  fxaaPass.material.uniforms["resolution"].value.y = 1 / (height * pixelRatio);
}

// Changes on scroll
function updateCamera() {
  // state.cZoom = 1 - Math.sin(window.scrollY / 1000.0);

  // Change content background opacity
  if (window.scrollY > 200) {
    writtenContent.style.opacity = 1;
    contentBg.style.opacity = 0.8;
  } else {
    writtenContent.style.opacity = 0;
    contentBg.style.opacity = 0;
  }

  // Change camera position
  myShader.uniforms.scroll.value = window.scrollY;
  camera.position.x = 1 + window.scrollY / 55.0;
  camera.position.y = 1 + window.scrollY / 55.0;
  camera.zoom = 1 + window.scrollY / 55.0;

  // Change logo glitching
  if (window.scrollY > 0 && glitchPass.enabled && !glitchPass.goWild) {
    scrollSvg.style.opacity = 0;
    glitchPass.enabled = false;
  } else if (window.scrollY === 0) {
    scrollSvg.style.opacity = 1;
    glitchPass.enabled = true;
  }

  // Update cameras
  camera.lookAt(new Vector3());
  camera.updateProjectionMatrix();
}

window.onbeforeunload = function() {
  window.scrollTo(0, 0);
};
