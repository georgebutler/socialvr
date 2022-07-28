
AFRAME.registerComponent("socialvr-proxvis", {
    init: function () {

        this.start = Date.now()
        this.current = Date.now()

        this.geometry = new THREE.RingGeometry( 1.2, 1.8, 16, 10, 3);
        this.ringMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: {value: 0.0}
            },
            vertexShader: `varying vec3 vPosition;
                            uniform float uTime;
                            void main() {
                                
                                vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                                vec4 viewPosition = viewMatrix * modelPosition;
                                vec4 projectedPosition = projectionMatrix * viewPosition;
                                gl_Position = projectedPosition;
                                vPosition = position;
                            }`,
            fragmentShader: 
            `
                varying vec3 vPosition;
                uniform float uTime;

                void main() {
                    vec3 color = vec3(1.0);

                    gl_FragColor = vec4(color,0.5 + sin(vPosition.x * 4.0 + uTime) / 2.0 );
                }
            `,
            transparent: true,
        })
        // this.material = new THREE.MeshStandardMaterial({ color: "blue" , side: THREE.DoubleSide});

        this.mesh = new THREE.Mesh(this.geometry, this.ringMaterial);
        this.mesh.rotateX(THREE.Math.degToRad(-90));
        this.mesh.position.z -= 0.5

        this.el.setObject3D("mesh", this.mesh);
    },
    tick: function(time, delta){
        const currentTime = Date.now()
        this.current = currentTime
        this.elapsed = this.current - this.start
        this.ringMaterial.uniforms.uTime.value = this.elapsed
        //
        // APP.componentRegistry["player-info"]
    },

    tock: function(time, delta) {
        
        /** 
        if (!this.data.target) { return; }
        if (!NAF.utils.isMine(this.el)) { return; }

        const scale = 0.1 * (delta / 1000);

        this.mesh.scale.addScalar(scale);
        this.mesh.scale.set(this.mesh.scale.x, this.mesh.scale.y, 1);
        this.mesh.matrixAutoUpdate = true;
        */
    }
});