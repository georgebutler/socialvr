function process() {
    const knowledge_ranks = { 1: '', 2: '', 3: '' };
    const skills_ranks = { 1: '', 2: '', 3: '' };
    const abilities_ranks = { 1: '', 2: '', 3: '' };
    let selected_canidate = null;

    const slots = document.querySelectorAll('[socialvr-barge-slot=""]');

    slots.forEach((slot) => {
        if (slot.components["socialvr-barge-slot"].data.type === "canidate") {
            let canidate1, canidate2, canidate3, canidate4;
            let result = null;

            document.querySelectorAll('.interactable').forEach((interactable) => {
                if (interactable.components["gltf-model-plus"]) {
                    if (interactable.components["gltf-model-plus"].data.src === "https://hubscloud-assets.socialsuperpowers.net/files/eda91395-193b-44d5-af66-327159f80980.glb") {
                        canidate1 = interactable
                    } else if (interactable.components["gltf-model-plus"].data.src === "https://hubscloud-assets.socialsuperpowers.net/files/0f59f587-f4a7-435a-af5d-f8c75a1f5ec6.glb") {
                        canidate2 = interactable
                    } else if (interactable.components["gltf-model-plus"].data.src === "https://hubscloud-assets.socialsuperpowers.net/files/1e4396b3-3a06-40e8-b33a-811f6da19cd2.glb") {
                        canidate3 = interactable
                    } else if (interactable.components["gltf-model-plus"].data.src === "https://hubscloud-assets.socialsuperpowers.net/files/40a1d1a6-771d-4ec3-8e23-38e08dc35f91.glb") {
                        canidate4 = interactable
                    }
                }
            });

            result = (slot.object3D.position.distanceTo(canidate1.object3D.position) <= slot.object3D.position.distanceTo(canidate2.object3D.position)) ? canidate1 : canidate2;
            result = (slot.object3D.position.distanceTo(canidate2.object3D.position) <= slot.object3D.position.distanceTo(canidate3.object3D.position)) ? canidate2 : canidate3;
            result = (slot.object3D.position.distanceTo(canidate3.object3D.position) <= slot.object3D.position.distanceTo(canidate4.object3D.position)) ? canidate3 : canidate4;

            if (result === canidate1) {
                selected_canidate = "Name 1";
            } else if (result === canidate2) {
                selected_canidate = "Name 2";
            } else if (result === canidate3) {
                selected_canidate = "Name 3";
            } else if (result === canidate4) {
                selected_canidate = "Name 4";
            }
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