precision mediump float;

#pragma glslify:snoise4=require(glsl-noise/simplex/4d)

attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;

uniform float time;
uniform float scroll;
uniform float hoverVal;
uniform float index;

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
	
	vec3 hoveredOffset=offset;
	float noiseA=snoise4(vec4(hoveredOffset.xyz,sin(time/20.)/20.))/200.;
	float noiseB=snoise4(vec4(hoveredOffset.xyz,cos(time/20.)/20.))/200.;
	
	hoveredOffset+=normal*mix(noiseA,noiseB,index);
	
	vec3 finalPosition=mix(offset,hoveredOffset,hoverVal);
	
	nposition=position;
	
	gl_Position=projectionMatrix*modelViewMatrix*vec4(finalPosition,1.);
}