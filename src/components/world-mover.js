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

            this.destinations.push(new window.APP.utils.THREE.Vector3(10, 0, 0).negate());
            this.destinations.push(new window.APP.utils.THREE.Vector3(10, 0, 20).negate());
            this.destinations.push(new window.APP.utils.THREE.Vector3(-10, 10, 20).negate());
            this.destinations.push(new window.APP.utils.THREE.Vector3(-10, 20, 30).negate());
        }

        // Networked Events
        this.el.sceneEl.addEventListener("startMovingWorld", this._start.bind(this));
        this.el.sceneEl.addEventListener("stopMovingWorld", this._stop.bind(this));

        NAF.connection.subscribeToDataChannel("startMovingWorld", this.start.bind(this));
        NAF.connection.subscribeToDataChannel("stopMovingWorld", this.stop.bind(this));

        // Load environment
        window.APP.utils.GLTFModelPlus
            .loadModel("https://statuesque-rugelach-4185bd.netlify.app/assets/moving-world-3.glb")
            .then((model) => {
                this.el.setObject3D("mesh", window.APP.utils.threeUtils.cloneObject3D(model.scene, true));
                this.el.setAttribute("matrix-auto-update", "");
            })
            .finally(() => {
                // Disable skybox
                const skybox = document.querySelector('[skybox=""]');

                if (skybox) {
                    skybox.parentNode.removeChild(skybox);
                }
            })
            .catch((e) => {
                console.error(e);
            });
    },

    remove: function () {
        this.el.sceneEl.removeEventListener("startMovingWorld");
        this.el.sceneEl.removeEventListener("stopMovingWorld");
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
            "https://hubscloud-assets.socialsuperpowers.net/files/40fb41d1-c6cd-4541-88f2-7386076b01ae.jpg"
        ];

        document.querySelectorAll("[media-image]").forEach((element) => {
            if (removeImages.includes(element.components["media-image"].data.src)) {
                element.parentNode.removeChild(element);
            }
        });

        const removeClasses = [
            ".ReadMe__setInvisibleOnBargeMove",
            ".GrabMe__setInvisibleOnBargeMove"
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
        NAF.connection.broadcastData("startMovingWorld", {});
    },

    _stop: function () {
        this.stop(null, null, {});
        NAF.connection.broadcastData("stopMovingWorld", {});
    }
})