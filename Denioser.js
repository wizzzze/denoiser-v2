var Denioser = function(renderer){
	this.renderer = renderer;

	this.viewScene = new THREE.Scene();
	this.viewScene.background = new THREE.Color(0,0,0);
	this.viewCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
	this.viewCamera.position.set( 0, 0, 1 );

	var quad = new THREE.PlaneBufferGeometry( 2 , 2 );
	var viewMaterial = new THREE.ShaderMaterial({
		uniforms : {
			buffer : { value : null },
		},
		vertexShader : DenoiserShader.vertexShader,
		fragmentShader : DenoiserShader.debugFragmentShader
	});

	this.viewQuad = new THREE.Mesh(quad, viewMaterial);
	this.viewScene.add(this.viewQuad);

	this.radius = 6;
	this.strength = 1;
	this.frame = 0;

};


Denioser.prototype = {
	init : function(){
		this.writeBuffer =  new THREE.WebGLRenderTarget( this.width, this.height, {
			wrapS: THREE.ClampToEdgeWrapping,
			wrapT: THREE.ClampToEdgeWrapping,
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			format: THREE.RGBAFormat,
			type: THREE.FloatType,
			stencilBuffer: false,
			depthBuffer: false
		});

		this.readBuffer = this.writeBuffer.clone();

		var textureData = new Float32Array( 4 );
		textureData[0] = 0;textureData[1] = 0;textureData[2] = 0;textureData[3] = 1;

		this.texture = new THREE.DataTexture( textureData, 1, 1, THREE.RGBAFormat, THREE.FloatType );

		this.viewQuad.material = new THREE.ShaderMaterial({
			uniforms : {
				noiseBuffer : {value : input.texture},
				readBuffer : {value : this.readBuffer.texture},
				frame : { value : this.frame },
				r : { value : null },
				c : { value : null },
				strength : { value : this.strength },
				resolution : { value : new THREE.Vector2(this.width, this.height)}
			},
			vertexShader : DenoiserShader.vertexShader,
			fragmentShader : DenoiserShader.denoiseShader,
		});
	
	},

	swapBuffer : function(){
		var temp = this.writeBuffer;
		this.writeBuffer = this.readBuffer;
		this.readBuffer = temp;
	},

	denoise : function(input){
		if(input instanceof THREE.WebGLRenderTarget){
			this.input = input.texture;
			this.width = input.width;
			this.height = input.height;
		}
		this.init();

		for(var i = -this.radius; i < this.radius; i++){
			for(var n = - this.radius; n < this.radius; n++){

				this.viewQuad.material.uniforms.readBuffer.value = this.frame == 0 ? this.texture :this.readBuffer.texture;
				this.viewQuad.material.uniforms.frame.value = this.frame;
				this.viewQuad.material.uniforms.r.value = i;
				this.viewQuad.material.uniforms.c.value = n;
				this.renderer.render(this.viewScene, this.viewCamera, this.writeBuffer);
				this.frame++;
				this.swapBuffer();
			}
		}
	},

};
