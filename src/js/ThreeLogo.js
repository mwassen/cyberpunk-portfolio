// THREE MODULES (three-full for ES6)
import { Scene } from "three-full/sources/scenes/Scene";
import { OrthographicCamera } from "three-full/sources/cameras/OrthographicCamera";
import { WebGLRenderer } from "three-full/sources/renderers/WebGLRenderer";
import { RawShaderMaterial } from "three-full/sources/materials/RawShaderMaterial";
import { Vector2 } from "three-full/sources/math/Vector2";
import { Vector3 } from "three-full/sources/math/Vector3";
import { RenderPass } from "three-full/sources/postprocessing/RenderPass";
import { ShaderPass } from "three-full/sources/postprocessing/ShaderPass";
import { GlitchPass } from "./GlitchPassMod";
import { UnrealBloomPass } from "three-full/sources/postprocessing/UnrealBloomPass";
import { EffectComposer } from "three-full/sources/postprocessing/EffectComposer";
import { FilmPass } from "three-full/sources/postprocessing/FilmPass";
import { FXAAShader } from "three-full/sources/shaders/FXAAShader";
import { GLTFLoader } from "three-full/sources/loaders/GLTFLoader";

// 3D MODEL
import logo3d from "../assets/mswsn3d.glb";

// SHADERS
import vShader from "../shaders/vertex1.glsl";
import fShader from "../shaders/fragment1.glsl";

// // DEV STUFF
// import * as dat from "dat.gui";
import Stats from "stats-js";

const LogoBg = browserState => {
  let { width, height, browserPixelRatio, onMobile, devMode } = browserState;

  // global vars
  const yOffset = onMobile ? 0.15 : 0;

  // global three vars
  const scene = new Scene();
  const camera = new OrthographicCamera();
  const renderer = new WebGLRenderer({ alpha: true });
  const shader = new RawShaderMaterial({
    uniforms: {
      time: { value: 1.0 },
      scroll: { value: 0.0 },
      resolution: { value: new Vector2() }
    },
    vertexShader: vShader,
    fragmentShader: fShader
  });

  // dev mode
  const statsWidget = devMode ? new Stats() : null;
  if (devMode) {
    statsWidget.showPanel(0);
    document.body.appendChild(statsWidget.dom);
  }

  // FX
  const composer = (() => {
    const renderPass = new RenderPass(scene, camera);

    const bloomPass = new UnrealBloomPass(
      new Vector2(width, height),
      1.5,
      0.15,
      0
    );
    bloomPass.renderToScreen = false;

    const filmPass = new FilmPass(0.25, 0.0, 1200, false); // grain opacity, scanlines opacity, scanlines amount, greyscale
    filmPass.renderToScreen = false;

    const glitchPass = new GlitchPass();
    glitchPass.renderToScreen = false;

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
    composer.addPass(filmPass);
    composer.addPass(glitchPass);
    composer.addPass(fxaaPass);

    return composer;
  })();

  // MODEL
  const model = (() => {
    return new Promise((resolve, reject) => {
      composer.passes[3].goWild = true;
      const loader = new GLTFLoader();
      loader.load(
        logo3d,
        gltf => {
          let logoMesh = gltf.scene.children[0];
          logoMesh.material = shader;

          // Set model rotation to fill screen
          if (width < 720) logoMesh.rotation.y = (720 - width) / -500;
          if (onMobile) logoMesh.position.set(0, yOffset, 0);

          frame = 0;
          scene.add(logoMesh);
          resolve(logoMesh);
        },
        xhr => {
          if (devMode) console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        },
        error => {
          reject(error);
        }
      );
    });
  })().catch(error => console.log(error));

  // Changes scale based on device dimensions and pixelratio, changes on resize/rerorient events
  const setScale = (width, height) => {
    let scale;
    if (width > height || width > 720) {
      scale = width / (7 * browserPixelRatio);
    } else scale = height / (4.5 * browserPixelRatio);
    model.then(loadedModel => {
      loadedModel.scale.set(scale, scale, scale);
    });
  };
  setScale(width, height);

  // CAMERA
  const updateCamera = () => {
    // Fit model to screen;
    const aspect = width / height;

    // Ortho zoom
    const zoom = 1;

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
    composer.setSize(width, height);
    renderer.setSize(width, height);

    camera.updateProjectionMatrix();
  };
  updateCamera();

  // ANIMATION
  let frame = 0;
  const animate = () => {
    if (devMode) statsWidget.begin();

    // Hover animations on model
    model.then(loadedModel => {
      // logoMesh.rotation.x = Math.sin(frame / 100);
      // logoMesh.rotation.z = Math.sin(frame / 50);
      loadedModel.rotation.z = Math.sin(frame / 400) / 100;
      loadedModel.rotation.x = Math.sin(frame / 1000) / 40 - 100;
      loadedModel.rotation.y += Math.sin(frame / 400) / 5000;
      loadedModel.position.set(0, yOffset + Math.sin(frame / 200) / 75, 0);
    });

    // Initial glitch
    if (frame == 75) composer.passes[3].goWild = false;

    // Shader time var
    shader.uniforms.time.value = frame / 10;
    composer.render();

    frame++;

    if (devMode) statsWidget.end();

    requestAnimationFrame(animate);
  };
  animate();

  // Called on resize/reorient events
  const resize = dimensions => {
    // Skip mobile toolbar hide/show
    if (onMobile && Math.abs(dimensions[1] - height) < 70) return;

    [width, height] = dimensions;

    if (onMobile) height += 70;

    model.then(loadedModel => {
      if (loadedModel && width > 720) loadedModel.rotation.y = 0;
      else if (loadedModel && width < 720) {
        loadedModel.rotation.y = (720 - width) / -500;
      }
    });

    setScale(width, height);
    updateCamera();

    const pixelRatio = renderer.getPixelRatio();
    composer.passes[4].material.uniforms["resolution"].value.x =
      1 / (width * pixelRatio);
    composer.passes[4].material.uniforms["resolution"].value.y =
      1 / (height * pixelRatio);
  };

  // Triggered by scroll events on page
  const scroll = yScrollPosition => {
    // Change camera position
    shader.uniforms.scroll.value = yScrollPosition / 750000;
    camera.position.x = 1 + yScrollPosition / 55.0;
    camera.position.y = 1 + yScrollPosition / 55.0;
    camera.zoom = 1 + yScrollPosition / 55.0;

    composer.passes[1].radius = 0.15 + yScrollPosition / 1500;

    // Change logo glitching
    if (
      yScrollPosition > 0 &&
      composer.passes[3].enabled &&
      !composer.passes[3].goWild
    ) {
      composer.passes[3].enabled = false;
    } else if (yScrollPosition === 0) {
      composer.passes[3].enabled = true;
    }

    // Update cameras
    camera.lookAt(new Vector3());
    camera.updateProjectionMatrix();
  };

  return {
    domElement: renderer.domElement,
    resize,
    scroll
  };
};

export default LogoBg;