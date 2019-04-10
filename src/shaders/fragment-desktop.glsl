precision highp float;

#pragma glslify:snoise4=require(glsl-noise/simplex/4d)

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
float odd1(float factor){
	return abs((sin(mod(nposition.x,time)/20.)))*factor;
}
float odd2(float factor){
	return cos(log2(vNormal.x*mod(time,5.)))*factor;
}

void main(){
	vec4 colorA=vec4(.02,0.,(sin(time/vNormal.y)+.5)*.4,norm1(.01)+.5);
	vec4 colorB=vec4(norm1(1.)+.5,.2,1.,(norm1(.01)+.5)*5.);
	
	vec4 untouched=mix(colorA,colorB,sin((time*vNormal.y)/10.));
	
	float n=snoise4(vec4(vUv.xy,nposition.y,time/20.));
	
	vec4 hoveredMix=vec4(vec3(n),n);
	
	vec4 color=mix(untouched,hoveredMix,hoverVal);
	
	gl_FragColor=color;
}

// vec4 hover1a=vec4(vec2(snoise2(vNormal.x,vNormal.y)),vNormal.z,sin(time));
// vec4 hover1b=vec4(odd2(.02),odd2(.001),odd1(.5),cos(vUv.y/nposition.x)+.5);
// vec4 hovered1=mix(hover1a,hover1b,sin((time/cos(vNormal.y))/50.)+.5);

// vec4 hover2a=vec4(odd1(.5),.0,.2,mod(vNormal.x,time)+.5);
// vec4 hover2b=vec4(.1,0.,odd1(.5),mod(vNormal.y,time)+.5);

// vec4 hovered2=mix(hover2a,hover2b,nposition.x+nposition.y*sin(time));

// vec4 hoveredMix=mix(hovered1,hovered2,index);