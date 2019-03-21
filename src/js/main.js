import * as THREE from "three";

const scene = new THREE.Scene();
const camera = new THREE.Camera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const loader = new THREE.GLTFLoader();
