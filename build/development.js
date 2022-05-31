(function () {
    'use strict';

    function CreateWorldObject(data) {
        let transform = data.components.find(el => el.name === "transform");

        if (transform) {
            let gltf = data.components.find(el => el.name === "gltf-model");

            let position = new window.APP.utils.THREE.Vector3(transform.props.position.x, transform.props.position.y, transform.props.position.z);
            let rotation = new window.APP.utils.THREE.Euler(transform.props.rotation.x, transform.props.rotation.y, transform.props.rotation.z, "XYZ");
            let scale = new window.APP.utils.THREE.Vector3(transform.props.scale.x, transform.props.scale.y, transform.props.scale.z);
        
            if (gltf) {
                const { entity } = window.APP.utils.addMedia(gltf.props.src, "#static-media", 1, null, false, false, true, gltf.props, false);
        
                entity.object3D.position.copy(position);
                entity.object3D.rotation.copy(rotation);
                entity.object3D.scale.copy(scale);
            }
        }
    }

    function InitWorldMover() {
        fetch("https://statuesque-rugelach-4185bd.netlify.app/assets/hangar.spoke")
            .then(response => {
                return response.json();
            })
            .then((data) => {
                for (const [key, entity] of Object.entries(data.entities)) {
                    CreateWorldObject(entity);
                }
            })
            .catch((e) => {
                console.error(e);
            });
    }

    //import "./components/toolbox-button";

    const scene = document.querySelector("a-scene");
    scene.addEventListener("environment-scene-loaded", () => {
      //console.log("[Social VR] Barge - Create Barge");

      //const [barge, bargeToolboxButton] = CreateBarge();
      //scene.appendChild(barge);
      // scene.appendChild(bargeToolboxButton);

      // Changes camera inspection system to show background, regardless of user preferences.
      //const cameraSystem = scene.systems["hubs-systems"].cameraSystem;
      //cameraSystem.lightsEnabled = true;

      // Floaty gravity change.
      //function disableFloatyPhysics() {
        //const floaties = document.querySelectorAll('[floaty-object=""]');

        //floaties.forEach((floaty) => {
          //floaty.setAttribute("floaty-object", { reduceAngularFloat: true, releaseGravity: 0, gravitySpeedLimit: 0 });
        //});
      //}

      //scene.addEventListener("object_spawned", (e) => {
        //disableFloatyPhysics();
      //});

      //disableFloatyPhysics();
      InitWorldMover();
    }, { once: true });

})();
//# sourceMappingURL=development.js.map
