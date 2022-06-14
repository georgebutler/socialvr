function process() {
    const knowledge_ranks = { 1: '', 2: '', 3: '' };
    const skills_ranks = { 1: '', 2: '', 3: '' };
    const abilities_ranks = { 1: '', 2: '', 3: '' };
    let selected_canidate = null;

    const slots = document.querySelectorAll('[socialvr-barge-slot=""]');

    slots.forEach((slot) => {
        if (slot.components["socialvr-barge-slot"].data.type === "canidate") {
            let slotPosition = new THREE.Vector3();
            let results = [
                {
                    el: null,
                    name: "Zoya A. Chopra",
                    distance: 9999
                },
                {
                    el: null,
                    name: "Robert P. Johnson",
                    distance: 9999
                },
                {
                    el: null,
                    name: "William K. Bevins",
                    distance: 9999
                },
                {
                    el: null,
                    name: "Kathy L. Stromm",
                    distance: 9999
                }
            ]

            slot.object3D.getWorldPosition(slotPosition);
            document.querySelectorAll('.interactable:not([super-spawner=""])').forEach((interactable) => {
                if (interactable.components["gltf-model-plus"]) {
                    if (interactable.components["gltf-model-plus"].data.src === "https://hubscloud-assets.socialsuperpowers.net/files/eda91395-193b-44d5-af66-327159f80980.glb") {
                        let c1Position = new THREE.Vector3();
                        interactable.object3D.getWorldPosition(c1Position);

                        results[0].el = interactable;
                        results[0].distance = slotPosition.distanceToSquared(c1Position);
                    } else if (interactable.components["gltf-model-plus"].data.src === "https://hubscloud-assets.socialsuperpowers.net/files/0f59f587-f4a7-435a-af5d-f8c75a1f5ec6.glb") {
                        let c2Position = new THREE.Vector3();
                        interactable.object3D.getWorldPosition(c2Position);

                        results[1].el = interactable;
                        results[1].distance = slotPosition.distanceToSquared(c2Position);
                    } else if (interactable.components["gltf-model-plus"].data.src === "https://hubscloud-assets.socialsuperpowers.net/files/1e4396b3-3a06-40e8-b33a-811f6da19cd2.glb") {
                        let c3Position = new THREE.Vector3();
                        interactable.object3D.getWorldPosition(c3Position);

                        results[2].el = interactable;
                        results[2].distance = slotPosition.distanceToSquared(c3Position);
                    } else if (interactable.components["gltf-model-plus"].data.src === "https://hubscloud-assets.socialsuperpowers.net/files/40a1d1a6-771d-4ec3-8e23-38e08dc35f91.glb") {
                        let c4Position = new THREE.Vector3();
                        interactable.object3D.getWorldPosition(c4Position);

                        results[3].el = interactable;
                        results[3].distance = slotPosition.distanceToSquared(c4Position);
                    }
                }
            });

            results.sort(function(a, b) {
                return a.distance - b.distance;
            });

            selected_canidate = results[0].name;
        }
    });

    const data = {
        completed: Date.now(),
        knowledge: knowledge_ranks,
        skills: skills_ranks,
        abilties: abilities_ranks,
        canidate: selected_canidate
    };

    //console.clear();
    console.log(JSON.stringify(data));
}

export { process };