// uniform float time;
precision highp float;

uniform float time;

varying vec2 vUv;
// varying vec3 vNormal;


void main () {
	vUv = uv / (sin( time) / 20.0);

	gl_Position = (projectionMatrix / (sin(time) + 1.5)) * modelViewMatrix * vec4(position * (sin(time / 100.0) + 1.5) / 2.0, 1.0 + sin((time / uv.y  * uv.x) / 20.0) / 20.0);
}