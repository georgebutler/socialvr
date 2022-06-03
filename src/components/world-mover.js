AFRAME.registerComponent("socialvr-world-mover", {
    init: function () {
        this.moving = false;
        this.destinations = [];
        this.currentDestination = -1;
        this.speed = 1;

        // Initialize Waypoints
        for (let i = 0; i <= 100; i++) {
            const waypoint = document.querySelector(".Waypoint_" + i);

            if (waypoint) {
                this.destinations.push(waypoint.object3D.position);
            }
        }

        // Networked Events
        const scene = document.querySelector("a-scene");

        scene.addEventListener("startMovingWorld", this._start.bind(this));
        scene.addEventListener("stopMovingWorld", this._stop.bind(this));

        NAF.connection.subscribeToDataChannel("startMovingWorld", this.start.bind(this));
        NAF.connection.subscribeToDataChannel("stopMovingWorld", this.stop.bind(this));
    },

    remove: function () {
        const scene = document.querySelector("a-scene");

        scene.removeEventListener("startMovingWorld");
        scene.removeEventListener("stopMovingWorld");
    },

    tick: function (time, delta) {
        if (this.moving) {
            this.el.object3D.position.z += this.speed * (delta / 1000)
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