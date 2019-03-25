precision highp float;

uniform float time;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 nposition;

void main () {





	vec4 colorA = vec4(0.02, 0.05, (sin(time / vNormal.y) + 0.5) * 0.4, sin((vNormal.y * nposition.x) / time * 0.01 ) + 0.5);
	vec4 colorB = vec4(sin((vNormal.y * nposition.x) / time) + 0.5, 0.2, 1.0, (sin((vNormal.y * nposition.x) / time * 0.01) + 0.5) * 5.0);

	vec4 color = mix(colorA, colorB, sin((time * vNormal.y) / 10.0 ));

	gl_FragColor = color;
}