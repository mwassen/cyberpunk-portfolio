precision highp float;

attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;

uniform float time;
uniform float scroll;
uniform float hoverVal;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

varying vec2 vUv;
varying vec3 nposition;
varying vec3 vNormal;

void main(){
	vUv=uv;
	
	vNormal=normal;
	
	vec3 offset=position;
	float dist=(sin(time/10.)+1.)*.05*scroll+scroll;
	
	offset.xyz+=normal*dist;
	
	nposition=position;
	
	gl_Position=projectionMatrix*modelViewMatrix*vec4(offset,1.);
}