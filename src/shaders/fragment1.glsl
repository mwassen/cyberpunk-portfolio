precision highp float;

uniform float time;
varying vec2 vUv;
varying vec3 vNormal;

void main () {
	// vec3 color = vec3(sin(time) + 1.0);
	vec3 colorA = vec3(0.0, (sin(time / 10.0 * vUv.x) + 1.5) * 0.4, 0.0);
	vec3 colorB = vec3(0.0, 0.0, sin(time / 8.0) + 1.5);

	vec3 color = mix(colorA, colorB, sin(time * 0.2 + cos(vUv.y)));

	gl_FragColor = vec4(color, 1.0 * vUv.y);
}