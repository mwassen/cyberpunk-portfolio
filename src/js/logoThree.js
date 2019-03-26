// IMPORTS
import * as THREE from "three";
import {
  WebGL,
  RenderPass,
  ShaderPass,
  FXAAShader,
  UnrealBloomPass,
  EffectComposer,
  GLTFLoader,
  DigitalGlitch,
  GlitchPass,
  SSAOPass
} from "three-full";
import * as dat from "dat.gui";
import Stats from "stats-js";

import "../css/main.css";

import logo3d from "../assets/mswsn3d.glb";

import vShader from "../shaders/vertex1.glsl";
import fShader from "../shaders/fragment1.glsl";

if (WebGL.isWebGLAvailable() === false) {
  document.body.appendChild(WebGL.getWebGLErrorMessage());
}

// SETUP
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera();
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });

// DOM references
const scrollSvg = document.getElementById("scroll-down");

// State for use in GUI and application
const state = {
  cZoom: 0.75,
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
const myShader = new THREE.RawShaderMaterial({
  uniforms: {
    time: { value: 1.0 },
    resolution: { value: new THREE.Vector2() }
  },

  vertexShader: vShader,
  fragmentShader: fShader
});

// EFFECTS
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
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

console.log(glitchPass);

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

uniforms["resolution"].value.x = 1 / (window.innerWidth * pixelRatio);
uniforms["resolution"].value.y = 1 / (window.innerHeight * pixelRatio);

const composer = new EffectComposer(renderer);
composer.setSize(window.innerWidth, window.innerHeight);
composer.addPass(renderPass);
composer.addPass(bloomPass);
composer.addPass(glitchPass);
// composer.addPass(SSAOPass);
composer.addPass(fxaaPass);

// EVENTS
window.addEventListener("resize", updateScene);
window.addEventListener("scroll", updateCamera);

// document.body.appendChild(renderer.domElement);
document.getElementById("three").appendChild(renderer.domElement);

updateScene();

// const testShader = new THREE.MeshPhysicalMaterial({});

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
  statsWidget.begin();
  requestAnimationFrame(animate);

  if (logoMesh) {
    // logoMesh.rotation.x = Math.sin(frame / 100);
    // logoMesh.rotation.z = Math.sin(frame / 50);
    logoMesh.rotation.x = Math.sin(frame / 100) / 10 - 100;
    logoMesh.rotation.y = Math.sin(frame / 300) / 10;
    logoMesh.position.set(0, Math.sin(frame / 40) / 75, 0);
  }
  if (frame == 75) {
    scrollSvg.style.opacity = 1;
    glitchPass.goWild = false;
  }

  myShader.uniforms.time.value += 0.1;
  frame++;
  composer.render();
  statsWidget.end();
}

animate();

function updateScene() {
  const width = window.innerWidth;
  const height = window.innerHeight;
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
  camera.lookAt(new THREE.Vector3());

  // Update the camera
  renderer.setSize(width, height);
  composer.setSize(width, height);

  camera.updateProjectionMatrix();

  const pixelRatio = renderer.getPixelRatio();
  fxaaPass.material.uniforms["resolution"].value.x = 1 / (width * pixelRatio);
  fxaaPass.material.uniforms["resolution"].value.y = 1 / (height * pixelRatio);
}

function updateCamera() {
  // state.cZoom = 1 - Math.sin(window.scrollY / 1000.0);
  camera.position.x = 1 - window.scrollY / 550.0;
  camera.position.y = 1 - window.scrollY / 550.0;
  if (window.scrollY > 0 && scrollSvg.style.opacity != 0) {
    scrollSvg.style.opacity = 0;
    glitchPass.enabled = false;
  } else if (window.scrollY === 0) {
    scrollSvg.style.opacity = 1;
    glitchPass.enabled = true;
  }
  camera.lookAt(new THREE.Vector3());
  camera.updateProjectionMatrix();
}
