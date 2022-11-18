const vectorRequiresUpdate = (epsilon) => {
    return () => {
        let prev = null;

        return curr => {
            if (prev === null) {
                prev = new THREE.Vector3(curr.x, curr.y, curr.z);
                return true;
            } else if (!NAF.utils.almostEqualVec3(prev, curr, epsilon)) {
                prev.copy(curr);
                return true;
            }

            return false;
        };
    };
}

export const sendLog = async (endpoint, obj) => {
    try {
        return await fetch(`https://log.socialsuperpowers.net/api/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(obj)
        })
    } catch (error) {
        console.error(`Log could not be sent: ${error}`);
    }
}

export function initSchemas() {
    // NAF Template (Emoji)
    const assets = document.querySelector("a-assets");
    const emojiTemplate = document.createElement("template");
    emojiTemplate.id = "sent-emoji";

    emojiTemplate.content.appendChild(document.createElement("a-entity"));
    assets.appendChild(emojiTemplate);

    // NAF Schema (Emoji)
    const emojiSchema = { ...NAF.schemas.schemaDict["#static-media"] }
    emojiSchema.template = "#sent-emoji";
    emojiSchema.components.push({ component: "position", requiresNetworkUpdate: vectorRequiresUpdate(0.001) });
    emojiSchema.components.push({ component: "rotation", requiresNetworkUpdate: vectorRequiresUpdate(0.5) });
    emojiSchema.components.push({ component: "scale", requiresNetworkUpdate: vectorRequiresUpdate(0.001) });
    emojiSchema.components.push({ component: "billboard", property: "onlyY" });
    emojiSchema.components.push({ component: "particle-emitter" });
    NAF.schemas.add(emojiSchema);

    // NAF Template (Button)
    /*
    const buttonTemplate = document.createElement("template");
    buttonTemplate.id = "socialvr-button";

    buttonTemplate.content.appendChild(document.createElement("a-entity"));
    assets.appendChild(buttonTemplate);
    */

    // NAF Schema (Button)
    /* 
    const buttonSchema = { ...NAF.schemas.schemaDict["#static-media"] }
    buttonSchema.template = "#socialvr-button";
    buttonSchema.components.push({ component: "position" });
    NAF.schemas.add(buttonSchema);
    */

    // NAF Template (World Mover)
    /* 
    const assets = document.querySelector("a-assets");
    const newTemplate = document.createElement("template");
    newTemplate.id = "sent-emoji";
    */

    // NAF Schema (World Mover)
    /*   
    const worldMoverSchema = { ...NAF.schemas.schemaDict["#static-media"] }
    worldMoverSchema.template = "#moving-world";
    worldMoverSchema.components.push({ component: "position", requiresNetworkUpdate: vectorRequiresUpdate(0.001) });
    worldMoverSchema.components.push({ component: "rotation", requiresNetworkUpdate: vectorRequiresUpdate(0.5) });
    worldMoverSchema.components.push({ component: "scale", requiresNetworkUpdate: vectorRequiresUpdate(0.001) });
    NAF.schemas.add(worldMoverSchema); 
    */
}