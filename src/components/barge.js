// responsible for barge children creation and movement

let positions = [];
let lastKeyChange = 0;

const width = 100;
const depth = 100;
const modelBarge = "https://hubscloud-assets.socialsuperpowers.net/files/f42c2e16-be56-4ffd-8a36-1a83123be134.glb"
const modelFlag1 = "https://hubscloud-assets.socialsuperpowers.net/files/570557bb-b5d5-4199-bd36-495c7e0496ff.glb"
const modelFlag2 = "https://hubscloud-assets.socialsuperpowers.net/files/8b4e9bfe-f820-4317-a9b1-bdf74a04336c.glb"

AFRAME.registerComponent("socialvr-barge", {
  schema: {
    speed: { type: "number", default: 1 },
    moving: { type: "boolean", default: false },
    targetKey: { type: "number", default: 0 }
  },

  init() {
    this.direction = new window.APP.utils.THREE.Vector3();
    this.bbox = new window.APP.utils.THREE.Box3();

    // Load barge model
    window.APP.utils.GLTFModelPlus.loadModel(modelBarge).then((model) => {
      console.log(`[Social VR] Barge System - Mesh Loaded`);
      const mesh = window.APP.utils.threeUtils.cloneObject3D(model.scene);
      const min = new window.APP.utils.THREE.Vector3(-6, -6, -100);
      const max = new window.APP.utils.THREE.Vector3(6, 6, 100);

      this.el.setObject3D("mesh", mesh);
      this.el.object3D.scale.set(1, 1, 1);
      this.el.object3D.matrixNeedsUpdate = true;
      this.bbox = new window.APP.utils.THREE.Box3(min, max);

      // Flag 1
      window.APP.utils.GLTFModelPlus.loadModel(modelFlag1).then((model) => {
        const obj = document.createElement("a-entity");
        const mesh = window.APP.utils.threeUtils.cloneObject3D(model.scene);

        obj.setObject3D("mesh", mesh);
        obj.object3D.matrixNeedsUpdate = true;
        obj.object3D.position.set(-4.4096465993449305, 0.3500000000000001, -5.22301500667883);
        obj.object3D.rotation.set(0, -30.00000000000003, 0);
        this.el.appendChild(obj);
      })

      // Flag 2
      window.APP.utils.GLTFModelPlus.loadModel(modelFlag2).then((model) => {
        const obj = document.createElement("a-entity");
        const mesh = window.APP.utils.threeUtils.cloneObject3D(model.scene);

        obj.setObject3D("mesh", mesh);
        obj.object3D.matrixNeedsUpdate = true;
        obj.object3D.position.set(4, 0.3500000000000001, 0.1693029598018416);
        obj.object3D.rotation.set(0, 5.000000000000118, 0);
        this.el.appendChild(obj);
      })

      // DEBUG
      //this.debugHelper = new window.APP.utils.THREE.BoxHelper(this.el.getObject3D("mesh"), 0xffff00);
      //this.el.sceneEl.object3D.add(this.debugHelper);
      //this.debugHelper.update();

      //console.log(`Min: ${this.bbox.min.x}, ${this.bbox.min.y}, ${this.bbox.min.z}`)
      //console.log(`Max: ${this.bbox.max.x}, ${this.bbox.max.y}, ${this.bbox.max.z}`)
    }).catch((e) => {
      console.error(`[Social VR] Barge System - ${e}`);
    })

    // Reset Button
    const buttonResetEl = document.createElement("a-sphere");
    buttonResetEl.setAttribute("socialvr-barge-button", "reset");
    buttonResetEl.setAttribute("radius", "0.15");
    buttonResetEl.setAttribute("material", "color: #3B56DC");
    buttonResetEl.setAttribute("tags", "singleActionButton: true");
    buttonResetEl.setAttribute("css-class", "interactable");
    buttonResetEl.setAttribute("position", {
      x: this.el.object3D.position.x + (2 - 0.2),
      y: this.el.object3D.position.y + 1,
      z: this.el.object3D.position.z
    });
    this.el.appendChild(buttonResetEl);

    // Start Button
    const buttonGoEl = document.createElement("a-sphere");
    buttonGoEl.setAttribute("socialvr-barge-button", "start");
    buttonGoEl.setAttribute("radius", "0.15");
    buttonGoEl.setAttribute("material", "color: #32CD32");
    buttonGoEl.setAttribute("tags", "singleActionButton: true");
    buttonGoEl.setAttribute("css-class", "interactable");
    buttonGoEl.setAttribute("position", {
      x: this.el.object3D.position.x + (2 - 0.2),
      y: this.el.object3D.position.y + 1,
      z: this.el.object3D.position.z + 1 // Right
    });
    this.el.appendChild(buttonGoEl);

    // Stop Button
    const buttonStopEl = document.createElement("a-sphere");
    buttonStopEl.setAttribute("socialvr-barge-button", "stop");
    buttonStopEl.setAttribute("radius", "0.15");
    buttonStopEl.setAttribute("material", "color: #FF0000");
    buttonStopEl.setAttribute("tags", "singleActionButton: true");
    buttonStopEl.setAttribute("css-class", "interactable");
    buttonStopEl.setAttribute("position", {
      x: this.el.object3D.position.x + (2 - 0.2),
      y: this.el.object3D.position.y + 1,
      z: this.el.object3D.position.z - 1 // Left
    });
    this.el.appendChild(buttonStopEl);

    window.APP.utils.waitForDOMContentLoaded().then(() => {
      const bargeSpawn = document.querySelector(".barge-placeholder");

      if (bargeSpawn) {
        this.el.object3D.position.set(bargeSpawn.object3D.position.x, bargeSpawn.object3D.position.y, bargeSpawn.object3D.position.z);
        bargeSpawn.object3D.visible = false;
      } else {
        this.el.object3D.position.set(-30, 2, 0);
      }
    })

    // Client
    this.el.addEventListener("startBargeEvent", this.startBarge.bind(this));
    this.el.addEventListener("stopBargeEvent", this.stopBarge.bind(this));
    this.el.addEventListener("resetBargeEvent", this.resetBarge.bind(this));

    // Broadcast Event
    NAF.connection.subscribeToDataChannel("startBarge", this._startBarge.bind(this));
    NAF.connection.subscribeToDataChannel("stopBarge", this._stopBarge.bind(this));
    NAF.connection.subscribeToDataChannel("resetBarge", this._resetBarge.bind(this));

    this.system.register(this.el);
  },

  remove() {
    this.el.removeEventListener("startBargeEvent", this.startBarge.bind(this));
    this.el.removeEventListener("stopBargeEvent", this.stopBarge.bind(this));
    this.el.removeEventListener("resetBargeEvent", this.resetBarge.bind(this));

    NAF.connection.unsubscribeToDataChannel("startBarge");
    NAF.connection.unsubscribeToDataChannel("stopBarge");
    NAF.connection.unsubscribeToDataChannel("resetBarge");

    this.el.removeObject3D("mesh");
    this.system.unregister();
  },

  tick(t, dt) {
    // TODO: more elegant solution?
    if (this.el.getAttribute("visible")) {
      this.el.play();
    } else {
      this.el.pause();
    }

    const position = this.el.object3D.position;
    const avatar = window.APP.componentRegistry["player-info"][0];
    const avposition = avatar.el.getAttribute("position");
    const characterController = this.el.sceneEl.systems["hubs-systems"].characterController;

    // Bounding box randomly breaks so let's do it the old school way.
    const bargeMinX = position.x - width / 2;
    const bargeMaxX = position.x + width / 2;
    const bargeMinZ = position.z - depth / 2;
    const bargeMaxZ = position.z + depth / 2;

    if (this.data.moving) {
      const targetPosition = positions[this.data.targetKey];
      const direction = this.direction;

      if (!targetPosition) {
        this.data.moving = false;
        return;
      }

      direction.copy(targetPosition).sub(position);

      if (position.distanceToSquared(targetPosition) >= 1) {
        const factor = this.data.speed / direction.length();

        // Barge movement
        ["x", "y", "z"].forEach(function(axis) {
          direction[axis] *= factor * (dt / 1000);
        });

        // Bounding box movement
        this.bbox.translate(direction);

        // DEBUG movement
        // this.debugHelper.update();

        // Mesh movement
        this.el.setAttribute("position", {
          x: position.x + direction.x,
          y: position.y + direction.y,
          z: position.z + direction.z
        });

        // Avatar Movement
        if (avposition.x >= bargeMinX && avposition.x <= bargeMaxX && avposition.z >= bargeMinZ && avposition.z <= bargeMaxZ) {
          characterController.barge = true;

          avatar.el.setAttribute("position", {
            x: avposition.x + direction.x,
            y: position.y - 2 / 2 + window.APP.utils.getCurrentPlayerHeight() / 2,
            z: avposition.z + direction.z
          });
        }

        // Floaty Movement
        const floaties = document.querySelectorAll('[floaty-object=""]');

        floaties.forEach((floaty) => {
          if (floaty.object3D.position.x >= bargeMinX && floaty.object3D.position.x <= bargeMaxX && floaty.object3D.position.z >= bargeMinZ && floaty.object3D.position.z <= bargeMaxZ) {
            const x = floaty.object3D.position.x
            const y = floaty.object3D.position.y
            const z = floaty.object3D.position.z

            floaty.object3D.position.set(x + direction.x, y - direction.y, z + direction.z)
          }
        });

        // Interactable Movement
        const interactables = document.querySelectorAll('[interactable=""]');

        interactables.forEach((interactable) => {
          if (interactable.object3D.position.x >= bargeMinX && interactable.object3D.position.x <= bargeMaxX && interactable.object3D.position.z >= bargeMinZ && interactable.object3D.position.z <= bargeMaxZ) {
            const x = interactable.object3D.position.x
            const y = interactable.object3D.position.y
            const z = interactable.object3D.position.z

            interactable.object3D.position.set(x + direction.x, y - direction.y, z + direction.z)
          }
        });
      } else {
        // Avatar floor height check
        if (avposition.x >= bargeMinX && avposition.x <= bargeMaxX && avposition.z >= bargeMinZ && avposition.z <= bargeMaxZ) {
          characterController.barge = false;
        }

        // NaN check
        if (isNaN(lastKeyChange) || t >= lastKeyChange) {
          lastKeyChange = t + 100;
          this.data.targetKey = this.data.targetKey + 1;
        }

        // console.log(t);
        // console.log(this.data.targetKey);
      }
    }

    characterController.fly = characterController.barge;
  },

  // eslint-disable-next-line no-unused-vars
  _startBarge(senderId, dataType, data, targetId) {
    positions = [];

    for (let i = 1; i < 100; i++) {
      const wp = document.querySelector(".Waypoint_" + i);

      if (wp) {
        positions.push(wp.object3D.position);
      }
    }

    if (positions.length >= 1) {
      console.log(`Registered ${positions.length} waypoints for the barge.`);
    } else {
      console.warn("No waypoints found!");
      console.warn("Registering some default waypoints for the barge.");

      positions.push(new window.APP.utils.THREE.Vector3(10, 0, 0));
      positions.push(new window.APP.utils.THREE.Vector3(10, 0, 20));
      positions.push(new window.APP.utils.THREE.Vector3(-10, 10, 20));
      positions.push(new window.APP.utils.THREE.Vector3(-10, 20, 30));
    }

    console.log(positions);
    this.data.moving = true;
  },

  // eslint-disable-next-line no-unused-vars
  _stopBarge(senderId, dataType, data, targetId) {
    this.data.moving = false;
  },

  // eslint-disable-next-line no-unused-vars
  _resetBarge(senderId, dataType, data, targetId) {
    this.data.targetKey = 0;
    this.data.moving = false;
    this.el.setAttribute("position", new window.APP.utils.THREE.Vector3(0, 0, 0));

    const avatar = window.APP.componentRegistry["player-info"][0];
    const characterController = this.el.sceneEl.systems["hubs-systems"].characterController;

    if (this.bbox.containsPoint(avatar.el.getAttribute("position"))) {
      avatar.el.setAttribute("position", new window.APP.utils.THREE.Vector3(0, 0, 0));
    }

    // Reset flight
    characterController.fly = false;

    // DEBUG movement
    // this.debugHelper.update();
  },

  startBarge() {
    this._startBarge(null, null, {});
    NAF.connection.broadcastData("startBarge", {});
  },

  stopBarge() {
    this._stopBarge(null, null, {});
    NAF.connection.broadcastData("stopBarge", {});
  },

  resetBarge() {
    this._resetBarge(null, null, {});
    NAF.connection.broadcastData("resetBarge", {});
  }
});
