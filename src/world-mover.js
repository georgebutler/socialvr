function CreateWorldObject(data) {
    let transform = data.components.find(el => el.name === "transform");

    if (transform) {
        let gltf = data.components.find(el => el.name === "gltf-model");

        let position = new window.APP.utils.THREE.Vector3(transform.props.position.x, transform.props.position.y, transform.props.position.z);
        let rotation = new window.APP.utils.THREE.Euler(transform.props.rotation.x, transform.props.rotation.y, transform.props.rotation.z, "XYZ");
        let scale = new window.APP.utils.THREE.Vector3(transform.props.scale.x, transform.props.scale.y, transform.props.scale.z);

        if (gltf) {
            const { entity } = window.APP.utils.addMedia(gltf.props.src, "#static-media", 1, null, false, false, true, {}, false);

            entity.object3D.position.copy(position);
            entity.object3D.rotation.copy(rotation);
            entity.object3D.scale.copy(scale);
        }
    }
}

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