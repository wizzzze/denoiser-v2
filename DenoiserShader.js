var DenoiserShader = {
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

#define STDEV 8.5

float gaussian(float r, float c) {
    return exp(-r*c/(STDEV*STDEV));
}

void main(){
    
    vec2 step = vec2(c/resolution.x , r/resolution.y);
    vec2 ouv = gl_FragCoord.xy/resolution.xy;
    vec2 nuv = ouv + step;

    vec4 oc = texture2D(readBuffer, ouv);
    // if(mod(uv.x, 8.) < 2. && mod(uv.x, 8.) > 6. && mod(uv.x, 8.) < 2. && mod(uv.y, 8.) > 6.){
    //     vec4 noiseColor = texture2D(noiseBuffer, uv);
    //     if(noiseColor == vec4(0., 0., 0., 1.)){
    //         gl_FragColor = oc;
    //         return;
    //     }
    // }

    float g = gaussian(r, c);
    vec4 color = texture2D(noiseBuffer, nuv);
    // gl_FragColor = color + oc ;
    gl_FragColor = mix(color, oc, 1./(1.+ float(frame)));
}
`,
denoiseShader2 : `

uniform sampler2D noiseBuffer;
uniform int radius;
uniform int frame;
uniform vec2 direction;
uniform float strength;
uniform vec2 resolution;

float gaussian(float r, float c) {
    return exp(-r*c/(STDEV*STDEV));
}

void main(){
    float x = gl_FragCoord.x;
    float y = gl_FragCoord.y;
    vec2 uv = gl_FragCoord / resolution;
    for(int i = 1; i <= radius; i++){
        vec2 step = vec2(i/resolution.x , i/resolution.y);
    }

    float g = gaussian(r, c);
    vec4 color = texture2D(noiseBuffer, uv);
    // gl_FragColor = color + oc ;
    gl_FragColor = mix(color, oc, 1./(1.+ float(frame)));
}
`,
debugFragmentShader : `
varying vec2 vUv;

uniform sampler2D buffer;

void main(){
    gl_FragColor = texture2D(buffer , vUv)*10.;
}
`,
};