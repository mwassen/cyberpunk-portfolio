// uniform float time;
precision highp float;

uniform float time;
// varying vec2 vUv;

// varying vec3 vNormal;

void main () {
	// vUv = uv;

	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}