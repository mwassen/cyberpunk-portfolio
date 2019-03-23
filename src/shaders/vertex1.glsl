// uniform float time;
precision highp float;

uniform float time;

varying vec2 vUv;
varying vec3 vNormal;


void main () {
	vUv = uv;
	vNormal = normal;

	gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(position, 1.0 + sin(time / uv.y / 5.0 * uv.x) / 40.0);
}