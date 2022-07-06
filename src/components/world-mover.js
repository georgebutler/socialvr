AFRAME.registerComponent("socialvr-world-mover", {
    init: function () {
        this.moving = false;
        this.destinations = [];
        this.currentDestination = 0;
        this.direction = new window.APP.utils.THREE.Vector3(0, 0, 0);
        this.speed = 1;
        this.lastCheck = 0;

        // Initialize Waypoints
        for (let i = 0; i <= 100; i++) {
            const waypoint = document.querySelector(".Waypoint_" + i);

            if (waypoint) {
                this.destinations.push(waypoint.object3D.position.negate());

                console.log(`Waypoint [${i}]: ${waypoint.object3D.position}`);
            }
        }

        if (this.destinations.length >= 1) {
            console.log(`Registered ${this.destinations.length} waypoints.`);
        } else {
            console.warn("No waypoints found!");
            console.warn("Registering default waypoints.");

            this.destinations.push(new THREE.Vector3(10, 0, 0).negate());
            this.destinations.push(new THREE.Vector3(10, 0, 20).negate());
            this.destinations.push(new THREE.Vector3(-10, 10, 20).negate());
            this.destinations.push(new THREE.Vector3(-10, 20, 30).negate());
        }

        // Networked Events
        this.el.sceneEl.addEventListener("startMovingWorld", this._start.bind(this));
        this.el.sceneEl.addEventListener("stopMovingWorld", this._stop.bind(this));

        NAF.connection.subscribeToDataChannel("startMovingWorld", this.start.bind(this));
        NAF.connection.subscribeToDataChannel("stopMovingWorld", this.stop.bind(this));

        // Load environment
        window.APP.utils.GLTFModelPlus
            .loadModel("https://statuesque-rugelach-4185bd.netlify.app/assets/moving-world-4.glb")
            .then((model) => {
                this.el.setObject3D("mesh", window.APP.utils.threeUtils.cloneObject3D(model.scene, true));
                this.el.setAttribute("matrix-auto-update", "");
            })
            .finally(() => {
                // Disable original sky
                const skybox = document.querySelector('[skybox=""]');

                if (skybox) {
                    skybox.removeObject3D("mesh");
                }

                // Create sky
                const sky = document.createElement("a-entity");
                const geometry = new THREE.SphereGeometry(8192, 8, 8);
                const material = new THREE.ShaderMaterial({
                    side: THREE.BackSide,
                    transparent: false,
                    fog: false,
                    uniforms: {
                        color1: {
                            value: new THREE.Color(0x87CEEB)
                        },
                        color2: {
                            value: new THREE.Color(0xF0FFFF)
                        }
                    },
                    vertexShader: `
                        varying vec2 vUv;
                    
                        void main() {
                          vUv = uv;
                          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
                        }
                      `,
                    fragmentShader: `
                        uniform vec3 color1;
                        uniform vec3 color2;
                      
                        varying vec2 vUv;
                        
                        void main() {
                          
                          gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
                        }
                      `
                });

                sky.setObject3D("mesh", new THREE.Mesh(geometry, material));
                this.el.sceneEl.appendChild(sky);
            })
            .catch((e) => {
                console.error(e);
            });
    },

    remove: function () {
        this.el.sceneEl.removeEventListener("startMovingWorld", this._start.bind(this));
        this.el.sceneEl.removeEventListener("stopMovingWorld", this._stop.bind(this));
    },

    tick: function (time, delta) {
        if (this.moving) {
            const target = this.destinations[this.currentDestination];

            if (target) {
                this.direction.copy(target).sub(this.el.object3D.position);

                if (this.el.object3D.position.distanceToSquared(target) >= 1) {
                    this.direction.multiplyScalar(this.speed / this.direction.length() * (delta / 1000));

                    this.el.object3D.position.x += this.direction.x;
                    this.el.object3D.position.y += this.direction.y;
                    this.el.object3D.position.z += this.direction.z;
                } else {
                    if (isNaN(this.lastCheck) || time >= this.lastCheck) {
                        this.lastCheck = time + 100;
                        this.currentDestination = this.currentDestination + 1;
                    }
                }
            } else {
                this.moving = false;
            }
        }
    },

    start: function () {
        this.moving = true;

        // Remove hangar objects
        const removeImages = [
            "https://hubscloud-assets.socialsuperpowers.net/files/04ff2033-e9f6-4f82-991a-0d7d530062f5.jpg",
            "https://hubscloud-assets.socialsuperpowers.net/files/40fb41d1-c6cd-4541-88f2-7386076b01ae.jpg",
            "https://hubscloud-assets.socialsuperpowers.net/files/5a57b59f-e76d-42ae-b01e-371673cf3624.png",
            "https://hubscloud-assets.socialsuperpowers.net/files/4878ef88-4761-485f-bfce-f40bbf577457.png",
            "https://hubscloud-assets.socialsuperpowers.net/files/0a65963c-8957-43c0-916d-da283efa5bf8.png",
            "https://hubscloud-assets.socialsuperpowers.net/files/95c62972-9d00-4e1c-ac42-f003d764c751.png"
        ];

        document.querySelectorAll("[media-image]").forEach((element) => {
            if (removeImages.includes(element.components["media-image"].data.src)) {
                element.parentNode.removeChild(element);
            }
        });

        const removeClasses = [
            ".tutorialblock1",
            ".tutorialblock2",
            ".tutorialblock3"
        ];

        removeClasses.forEach((target) => {
            const element = document.querySelector(target);

            if (element) {
                element.parentNode.removeChild(element);
            }
        });
    },

    stop: function () {
        this.moving = false;
    },

    _start: function () {
        this.start(null, null, {});
        NAF.connection.broadcastDataGuaranteed("startMovingWorld", {});
    },

    _stop: function () {
        this.stop(null, null, {});
        NAF.connection.broadcastDataGuaranteed("stopMovingWorld", {});
    }
})