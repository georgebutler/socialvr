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
    this.speed = 1;
    this.lastCheck = 0;

    // Register Waypoints
    for (let i = 0; i <= 100; i++) {
      const waypoint = document.querySelector(".waypoint-" + i);

      if (waypoint) {
        console.log(waypoint.object3D.position);
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
        this.el.setAttribute("animation__worldshrink", {
          property: "scale",
          from: "0.01 0.01 0.01",
          to: "1 1 1",
          dur: 10000,
          startEvents: 'startworldshrink'
        });
        this.el.setAttribute("animation__worldshrink2", {
          property: "position",
          to: "-300 0 0",
          dur: 10000,
          startEvents: 'startworldshrink'
        });
      })
      .finally(() => {
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
              value: new THREE.Color(0x798188)
            },
            color2: {
              value: new THREE.Color(0x7BA7C6)
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

      if (!intro.playedAudio && this.currentDestination === 1) {
        intro.playedAudio = true;
        intro.play();
      }

      if (!section2.playedAudio && this.currentDestination === 3) {
        section2.playedAudio = true;
        section2.play();
      }

      if (!section3.playedAudio && this.currentDestination === 7) {
        section3.playedAudio = true;
        section3.play();
      }

      if (!section4.playedAudio && this.currentDestination === 17) {
        section4.playedAudio = true;
        section4.play();
      }

      if (!section5.playedAudio && this.currentDestination === 30) {
        section5.playedAudio = true;
        section5.play();
      }

      if (!outro.playedAudio && this.currentDestination === 51) {
        outro.playedAudio = true;
        outro.play();
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