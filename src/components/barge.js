// responsible for barge children creation and movement

let positions = [];
let lastKeyChange = 0;
let shouldAvatarBeInBargeMode = false;

const width = 30;
const depth = 30;

function moveWithBox(parent, child, direction, isAvatar) {
  const parentPosition = parent.object3D?.position;
  const childPosition = child.object3D?.position;

  const minX = parentPosition.x - width;
  const maxX = parentPosition.x + width;
  const minZ = parentPosition.z - depth;
  const maxZ = parentPosition.z + depth;
  
  // Don't bring "removefrombarge" objects.
  if (child.className.search(/removefrombarge/i) < 0) {
    if (childPosition.x >= minX && childPosition.x <= maxX && childPosition.z >= minZ && childPosition.z <= maxZ) {
      if (isAvatar) {
        child.setAttribute("position", {
          x: childPosition.x + direction.x,
          y: parentPosition.y + window.APP.utils.getCurrentPlayerHeight() / 2.7,
          z: childPosition.z + direction.z
        });
      } else {
        child.setAttribute("position", {
          x: childPosition.x + direction.x,
          y: childPosition.y + direction.y,
          z: childPosition.z + direction.z
        });
      }
  
      return true;
    }
  }

  return false;
}

AFRAME.registerComponent("socialvr-barge", {
  schema: {
    speed: { type: "number", default: 1 },
    moving: { type: "boolean", default: false },
    targetKey: { type: "number", default: 0 }
  },

  init() {
    const scene = document.querySelector("a-scene");

    this.direction = new window.APP.utils.THREE.Vector3();

    // Reset Button
    const buttonResetEl = document.createElement("a-entity");
    buttonResetEl.setAttribute("socialvr-barge-button", "text: Reset; eventName: resetBargeEvent; radius: 0.15; color: #3B56DC");
    buttonResetEl.setAttribute("position", {
      x: this.el.object3D.position.x + (2 - 0.2),
      y: this.el.object3D.position.y + 1,
      z: this.el.object3D.position.z
    });

    // Start Button
    const buttonGoEl = document.createElement("a-entity");
    buttonGoEl.setAttribute("socialvr-barge-button", "text: Go; eventName: startBargeEvent; radius: 0.15; color: #32CD32");
    buttonGoEl.setAttribute("position", {
      x: this.el.object3D.position.x + (2 - 0.2),
      y: this.el.object3D.position.y + 1,
      z: this.el.object3D.position.z + 1 // Right
    });
    
    // Stop Button
    const buttonStopEl = document.createElement("a-entity");
    buttonStopEl.setAttribute("socialvr-barge-button", "text: Stop; eventName: stopBargeEvent; radius: 0.15; color: #FF0000");
    buttonStopEl.setAttribute("position", {
      x: this.el.object3D.position.x + (2 - 0.2),
      y: this.el.object3D.position.y + 1,
      z: this.el.object3D.position.z - 1 // Left
    });
    
    //scene.appendChild(buttonResetEl);
    //scene.appendChild(buttonGoEl);
    //scene.appendChild(buttonStopEl);

    // Client
    scene.addEventListener("startBargeEvent", this.startBarge.bind(this));
    scene.addEventListener("stopBargeEvent", this.stopBarge.bind(this));
    scene.addEventListener("resetBargeEvent", this.resetBarge.bind(this));

    // Broadcast Event
    NAF.connection.subscribeToDataChannel("startBarge", this._startBarge.bind(this));
    NAF.connection.subscribeToDataChannel("stopBarge", this._stopBarge.bind(this));
    NAF.connection.subscribeToDataChannel("resetBarge", this._resetBarge.bind(this));

    this.system.register(this.el);
  },

  remove() {
    const scene = document.querySelector("a-scene");

    scene.removeEventListener("startBargeEvent", this.startBarge.bind(this));
    scene.removeEventListener("stopBargeEvent", this.stopBarge.bind(this));
    scene.removeEventListener("resetBargeEvent", this.resetBarge.bind(this));

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

    shouldAvatarBeInBargeMode = false;
    const position = this.el.object3D.position;

    if (this.data.moving) {
      const targetPosition = positions[this.data.targetKey];
      const direction = this.direction;

      if (!targetPosition) {
        this.data.moving = false;
        return;
      }

      direction.copy(targetPosition).sub(position);
      if (position.distanceToSquared(targetPosition) >= 1) {
        // Barge movement
        const factor = this.data.speed / direction.length();
        direction.multiplyScalar(factor * (dt / 1000));

        // Mesh movement
        this.el.setAttribute("position", {
          x: position.x + direction.x,
          y: position.y + direction.y,
          z: position.z + direction.z
        });

        // Child Movement
        const children = document.querySelectorAll('[socialvr-barge-child=""]');

        children.forEach((child) => {
          moveWithBox(this.el, child, direction, false);
        });

        // Floaty Movement
        const floaties = document.querySelectorAll('[floaty-object=""]');

        floaties.forEach((floaty) => {
          moveWithBox(this.el, floaty, direction, false);
        });

        // Interactable Movement
        const interactables = document.querySelectorAll('[interactable=""]');

        interactables.forEach((interactable) => {
          moveWithBox(this.el, interactable, direction, false);
        });

        // Avatar Movement
        shouldAvatarBeInBargeMode = moveWithBox(this.el, window.APP.componentRegistry["player-info"][0].el, direction, true);
      } else {
        // NaN check
        if (isNaN(lastKeyChange) || t >= lastKeyChange) {
          lastKeyChange = t + 100;
          this.data.targetKey = this.data.targetKey + 1;
        }

        // console.log(t);
        // console.log(this.data.targetKey);
      }
    }
  },

  _startBarge(senderId, dataType, data, targetId) {
    positions = [];

    for (let i = 0; i < 100; i++) {
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
    this.el.sceneEl.systems["hubs-systems"].characterController.fly = true;
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
    avatar.el.setAttribute("position", new window.APP.utils.THREE.Vector3(0, 0, 0));
    shouldAvatarBeInBargeMode = false;
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
