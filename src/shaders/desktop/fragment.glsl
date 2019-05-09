precision mediump float;

#pragma glslify:snoise4=require(glsl-noise/simplex/4d)
#pragma glslify:hsl2rgb=require(glsl-hsl2rgb)
#pragma glslify:asciiFilter=require(glsl-ascii-filter)

uniform float time;
uniform float scroll;
uniform float hoverVal;
uniform float index;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 nposition;

float norm1(float factor){
	return sin((vNormal.y*nposition.x)/time*factor);
}

void main(){
	vec4 colorA=vec4(.02,0.,(sin(time/vNormal.y)+.5)*.4,norm1(.01)+.5);
	vec4 colorB=vec4(norm1(1.)+.5,.2,1.,(norm1(.01)+.5)*5.);
	
	float slowTime=time*.01;
	
	float n=snoise4(vec4(vNormal.xyz,slowTime));
	vec3 hovercolor1=hsl2rgb(.75+n*.2-.1*index,.85,.5*vNormal.x);
	
	// vec3 hoverAscii=hovercolor1*asciiFilter(hovercolor1,vUv.xy);
	
	vec4 hoveredMix=vec4(hovercolor1,.1);
	vec4 untouched=mix(colorA,colorB,sin((time*vNormal.y)/10.));
	
	vec4 color=mix(untouched,hoveredMix,hoverVal);
	
	gl_FragColor=color;
}