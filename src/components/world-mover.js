AFRAME.registerComponent("socialvr-world-mover", {
    init: function () {
        this.moving = false;
        this.destinations = [];
        this.currentDestination = -1;
        this.direction = new window.APP.utils.THREE.Vector3(0, 0, 0);
        this.speed = 1;
        this.lastCheck = 0;

        // Initialize Waypoints
        for (let i = 0; i <= 100; i++) {
            const waypoint = document.querySelector(".Waypoint_" + i);

            if (waypoint) {
                this.destinations.push(waypoint.object3D.position);
                console.log(`Waypoint [${i}]: ${waypoint.object3D.position}`);
            }
        }

        // Networked Events
        this.el.sceneEl.addEventListener("startMovingWorld", this._start.bind(this));
        this.el.sceneEl.addEventListener("stopMovingWorld", this._stop.bind(this));

        NAF.connection.subscribeToDataChannel("startMovingWorld", this.start.bind(this));
        NAF.connection.subscribeToDataChannel("stopMovingWorld", this.stop.bind(this));
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
                    direction.multiplyScalar(this.speed / this.direction.length() * (delta / 1000));

                    this.el.object3D.position.x += direction.x;
                    this.el.object3D.position.y += direction.y;
                    this.el.object3D.position.z += direction.z;
                } else {
                    if (isNaN(this.lastCheck) || time >= this.lastCheck) {
                        this.lastCheck = time + 100;
                        this.currentDestination = this.currentDestination + 1;
                    }
                }
            } else {
                this.moving = false;
                return
            }
        }
    },

    start: function () {
        this.moving = true;
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