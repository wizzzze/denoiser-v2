var DenioserShader = {
	vertexShader : `
varying vec2 vUv;

void main(){
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}

`,
denoiseShader : `

uniform sampler2D noiseBuffer;
uniform sampler2D readBuffer;
uniform float r;
uniform float c;
uniform int radius;
uniform int frame;
uniform float strength;
uniform vec2 resolution;

#define STDEV 6.5

float gaussian(float r, float c) {
    return exp(-r*c/(STDEV*STDEV));
}

void main(){
    
    float u = gl_FragCrood.x + c;
    float v = gl_FragCrood.y + r;
    vec2 uv = vec2(u/resolution.x, v / resolution.y);
    vec4 oc = texture2D(readBuffer, vUv);
    if(mod(u, 8.) < 2. && mod(u, 8.) > 6. && mod(v, 8.) < 2. && mod(v, 8.) > 6.){
        vec4 noiseColor = texture2D(noiseBuffer, uv);
        if(noiseColor == vec4(0., 0., 0., 1.)){
            gl_FragColor = oc;
        }
    }

    float g = gaussian(r, c);
    vec4 color = g * texture2D(noiseBuffer, uv);

    gl_FragColor = mix(color, oc, 1./(1.+ float(frame)));
}
`,
};