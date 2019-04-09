precision highp float;

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
	return abs((sin(mod(nposition.y,time)/20.))*factor);
}
// float odd2(float factor){
	// 		return abs(cos()*factor)
// }

void main(){
	vec4 colorA=vec4(.02,0.,(sin(time/vNormal.y)+.5)*.4,norm1(.01)+.5);
	vec4 colorB=vec4(norm1(1.)+.5,.2,1.,(norm1(.01)+.5)*5.);
	
	vec4 untouched=mix(colorA,colorB,sin((time*vNormal.y)/10.));
	
	vec4 hover1a=vec4(odd1(.5),0.,.1,.2);
	vec4 hover1b=vec4(.1,0.,odd1(.5),.2);
	vec4 hovered1=mix(hover1a,hover1b,sin((time/cos(vNormal.y))/50.)+.5);
	
	vec4 hover2a=vec4(odd1(.5),.0,.2,.2);
	vec4 hover2b=vec4(.1,0.,odd1(.5),.2);
	
	vec4 hovered2=mix(hover2a,hover2b,sin((time/sin(vNormal.y))/60.));
	
	vec4 hoveredMix=mix(hovered1,hovered2,index);
	
	vec4 color=mix(untouched,hoveredMix,hoverVal);
	
	gl_FragColor=color;
}