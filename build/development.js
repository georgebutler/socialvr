(function () {
    'use strict';

    AFRAME.registerComponent("socialvr-world-mover", {
        init: function() {
        },

        tick: function (time, delta) {
            this.el.object3D.position.z += 1 * (delta / 1000);
        }
    });

    // import "./components/toolbox-button";

    // import "./systems/barge";
    // import { CreateBarge } from "./systems/barge";

    const scene = document.querySelector("a-scene");
    scene.addEventListener("environment-scene-loaded", () => {
      // console.log("[Social VR] Barge - Create Barge");

      // const [barge, bargeToolboxButton] = CreateBarge();
      // scene.appendChild(barge);
      // scene.appendChild(bargeToolboxButton);

      // // Changes camera inspection system to show background, regardless of user preferences.
      // const cameraSystem = scene.systems["hubs-systems"].cameraSystem;
      // cameraSystem.lightsEnabled = true;

      // // Floaty gravity change.
      // function disableFloatyPhysics() {
      //   const floaties = document.querySelectorAll('[floaty-object=""]');

      //   floaties.forEach((floaty) => {
      //     floaty.setAttribute("floaty-object", { reduceAngularFloat: true, releaseGravity: 0, gravitySpeedLimit: 0 });
      //   });
      // }

      // scene.addEventListener("object_spawned", (e) => {
      //   disableFloatyPhysics();
      // });

      // disableFloatyPhysics();

      const worldMover = document.createElement("a-entity");
      worldMover.setAttribute("socialvr-world-mover", "");
      scene.appendChild(worldMover);

      window.APP.utils.GLTFModelPlus
        .loadModel("https://statuesque-rugelach-4185bd.netlify.app/assets/moving-world.glb")
        .then((model) => {
          worldMover.setObject3D("mesh", window.APP.utils.threeUtils.cloneObject3D(model.scene, true));
          worldMover.setAttribute("matrix-auto-update", "");
        })
        .catch((e) => {
          console.error(e);
        });
    }, { once: true });

})();
//# sourceMappingURL=development.js.map
