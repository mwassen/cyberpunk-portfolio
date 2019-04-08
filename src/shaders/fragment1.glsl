precision highp float;

uniform float time;
uniform float scroll;
uniform float hoverVal;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 nposition;

float norm1(float factor){
	return sin((vNormal.y*nposition.x)/time*factor);
}

void main(){
	vec4 colorA=vec4(.02,0.,(sin(time/vNormal.y)+.5)*.4,norm1(.01)+.5);
	vec4 colorB=vec4(norm1(1.)+.5,.2,1.,(norm1(.01)+.5)*5.);
	
	vec4 untouched=mix(colorA,colorB,sin((time*vNormal.y)/10.));
	
	vec4 messy=vec4(vNormal.y*sin(pow(vUv.x,time/10.)),.2,.1,.5);
	
	vec4 color=mix(untouched,messy,hoverVal);
	
	gl_FragColor=color;
}