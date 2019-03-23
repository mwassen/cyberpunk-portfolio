// IMPORT JS
import * as THREE from "three";
import GLTFLoader from "three-gltf-loader";

// IMPORT CSS
import "../css/main.css";

// IMPORT MODEL
import logo3d from "../assets/mswsn3d.glb";

// IMPORT SHADERS
import vShader from "../shaders/vertex1.glsl";
import fShader from "../shaders/fragment1.glsl";

// Setup
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera();
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

updateScene();

// EVENTS
window.addEventListener("resize", updateScene);
window.addEventListener("scroll", updateCamera);

// document.body.appendChild(renderer.domElement);
document.getElementById("threeHead").appendChild(renderer.domElement);

// LIGHTS
const light1 = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(light1);

const light2 = new THREE.PointLight(0xffffff, 0.5);
scene.add(light2);
light2.lookAt(new THREE.Vector3());

let logoMesh;

// SHADERS
const myShader = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 1.0 },
    resolution: { value: new THREE.Vector2() }
  },

  vertexShader: vShader,
  fragmentShader: fShader
});

// MODELS
const loader = new GLTFLoader();
loader.load(
  logo3d,
  gltf => {
    logoMesh = gltf.scene.children[0];
    logoMesh.material = myShader;
    logoMesh.scale.set(70, 70, 70);
    scene.add(logoMesh);
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
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  if (logoMesh) {
    // logoMesh.rotation.x = Math.sin(frame / 100);
    // logoMesh.rotation.z = Math.sin(frame / 50);
    logoMesh.rotation.x = Math.sin(frame / 100) / 10 - 100;
    logoMesh.rotation.y = Math.sin(frame / 300) / 10;
    logoMesh.position.set(0, Math.sin(frame / 40) / 75, 0);
  }
  myShader.uniforms.time.value += 0.1;
  frame++;
}

animate();

function updateScene() {
  const aspect = window.innerWidth / window.innerHeight;

  // Ortho zoom
  const zoom = 1.0;

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
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.updateProjectionMatrix();
}

function updateCamera() {
  camera.position.x = 1 - window.scrollY / 550.0;
  camera.position.y = 1 - window.scrollY / 550.0;
  camera.lookAt(new THREE.Vector3());
  camera.updateProjectionMatrix();
}
