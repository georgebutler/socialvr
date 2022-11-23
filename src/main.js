const intro = new Audio("https://alex-leeds--statuesque-rugelach-4185bd.netlify.app/assets/audio/intro.mp3");
const outro = new Audio("https://alex-leeds--statuesque-rugelach-4185bd.netlify.app/assets/audio/outro.mp3");
const section2 = new Audio("https://alex-leeds--statuesque-rugelach-4185bd.netlify.app/assets/audio/section2.mp3");
const section3 = new Audio("https://alex-leeds--statuesque-rugelach-4185bd.netlify.app/assets/audio/section3.mp3");
const section4 = new Audio("https://alex-leeds--statuesque-rugelach-4185bd.netlify.app/assets/audio/section4.mp3");
const section5 = new Audio("https://alex-leeds--statuesque-rugelach-4185bd.netlify.app/assets/audio/section5.mp3");

AFRAME.registerComponent("leeds-world-mover", {
  init: function () {
    this.moving = false;
    this.destinations = [];
    this.currentDestination = 0;
    this.direction = new THREE.Vector3(0, 0, 0);
    this.speed = 2;
    this.lastCheck = 0;

    // Register Waypoints
    for (let i = 0; i <= 100; i++) {
      const waypoint = document.querySelector(".waypoint-" + i);

      if (waypoint) {
        this.destinations.push(waypoint.object3D.position.negate());
      }
    }

    // Networked Events
    this.el.sceneEl.addEventListener("startMovingWorld", this._start.bind(this));
    this.el.sceneEl.addEventListener("stopMovingWorld", this._stop.bind(this));

    NAF.connection.subscribeToDataChannel("startMovingWorld", this.start.bind(this));
    NAF.connection.subscribeToDataChannel("stopMovingWorld", this.stop.bind(this));

    // Load Model
    window.APP.utils.GLTFModelPlus
      .loadModel("https://alex-leeds--statuesque-rugelach-4185bd.netlify.app/assets/environment-11.23.glb")
      .then((model) => {
        this.el.setObject3D("mesh", window.APP.utils.cloneObject3D(model.scene));
        this.el.object3D.scale.set(10, 10, 10);
        this.el.object3D.matrixNeedsUpdate = true;
        /*
        this.el.setAttribute("animation__worldshrink", {
          property: "scale",
          from: "0.01 0.01 0.01",
          to: "1 1 1",
          dur: 10000,
          startEvents: 'startworldshrink'
        });
        */
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

      if (!intro.playedAudio && this.currentDestination === 0) {
        intro.playedAudio = true;
        intro.play();
      }

      if (target) {
        this.direction.copy(target).sub(this.el.object3D.position);

        if (this.el.object3D.position.distanceToSquared(target) >= 1) {
          this.direction.multiplyScalar(this.speed / this.direction.length() * (delta / 1000));

          this.el.setAttribute("position", {
            x: this.el.object3D.position.x + this.direction.x,
            y: this.el.object3D.position.y + this.direction.y,
            z: this.el.object3D.position.z + this.direction.z,
          });
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
});

AFRAME.registerComponent("leeds-button", {
  init: function () {
    this.geometry = new THREE.SphereGeometry(0.2, 16, 8);
    this.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.el.setObject3D("mesh", this.mesh);
    this.el.setAttribute("tags", { singleActionButton: true });
    this.el.setAttribute("is-remote-hover-target", "");
    this.el.setAttribute("hoverable-visuals", "");
    this.el.classList.add("interactable");

    this.onClick = this.onClick.bind(this);
    this.el.object3D.addEventListener("interact", this.onClick);
  },

  remove: function () {
    this.el.object3D.removeEventListener("interact", this.onClick);
  },

  onClick: function () {
    this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(18);
    document.querySelector("#leedsworld").emit("startworldshrink", null, false);
    this.el.sceneEl.emit("startMovingWorld");
    this.el.sceneEl.removeChild(this.el);
  }
});

APP.scene.addEventListener("environment-scene-loaded", () => {
  const world = document.createElement("a-entity");
  world.id = "leedsworld";
  world.setAttribute("leeds-world-mover", "");
  world.object3D.scale.set(0.01, 0.01, 0.01);
  window.APP.scene.appendChild(world);

  const button = document.createElement("a-entity");
  button.setAttribute("leeds-button", "");
  button.object3D.position.set(0, 2, 0);

  window.APP.scene.appendChild(button);
}, { once: true });