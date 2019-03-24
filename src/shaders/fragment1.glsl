precision highp float;

uniform float time;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 nposition;

void main () {
	// vec3 color = vec3(sin(time) + 1.0);
	vec3 colorA = vec3(0.7, (sin(time / 2.0 * nposition.z) + 1.5) * 0.4, 0.5);
	vec3 colorB = vec3(nposition.y / 2.0, 0.5, sin(time / 10.0) + 1.5);

	vec3 color = mix(colorA, colorB, sin(time / 10.0 + cos(nposition.z)));

	gl_FragColor = vec4(color, 1.0 );
}