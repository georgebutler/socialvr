// https://github.com/georgebutler/hubs/blob/master/src/utils/media-utils.js#L143

AFRAME.registerSystem("socialvr-world-mover", {
    init: function () {
        this.world = []

        fetch("https://statuesque-rugelach-4185bd.netlify.app/assets/moving-hangar-world.spoke")
            .then(response => {
                return response.json();
            })
            .then((data) => {
                for (const [key, dta] of Object.entries(data.entities)) {
                    let transform = dta.components.find(el => el.name === "transform");

                    if (transform) {
                        let gltf = dta.components.find(el => el.name === "gltf-model");

                        let position = new window.APP.utils.THREE.Vector3(transform.props.position.x, transform.props.position.y, transform.props.position.z);
                        let rotation = new window.APP.utils.THREE.Euler(transform.props.rotation.x, transform.props.rotation.y, transform.props.rotation.z, "XYZ");
                        let scale = new window.APP.utils.THREE.Vector3(transform.props.scale.x, transform.props.scale.y, transform.props.scale.z);

                        if (gltf) {
                            const entity = document.createElement("a-entity");

                            window.APP.utils.GLTFModelPlus
                                .loadModel(gltf.props.src)
                                .then((model) => {
                                    const scene = document.querySelector("a-scene");

                                    entity.setObject3D("mesh", window.APP.utils.threeUtils.cloneObject3D(model.scene, false));
                                    entity.object3D.position.copy(position);
                                    entity.object3D.rotation.copy(rotation);
                                    entity.object3D.scale.copy(scale);
                                    entity.object3D.matrixNeedsUpdate = true;

                                    scene.appendChild(entity);
                                    this.world.push(entity);
                                })
                                .catch((e) => {
                                    console.error(e);
                                });
                        }
                    }
                }
            })
            .catch((e) => {
                console.error(e);
            });
    },

    tick: function (delta) {

    }
});

export function InitWorldMover() {
    fetch("https://statuesque-rugelach-4185bd.netlify.app/assets/hangar.spoke")
        .then(response => {
            return response.json();
        })
        .then((data) => {
            for (const [key, entity] of Object.entries(data.entities)) {
                CreateWorldObject(entity)
            }
        })
        .catch((e) => {
            console.error(e);
        });
}