import "./components/emoji";
import "./components/emoji-target";
import "./components/emoji-button";
import "./components/emoji-cancel-button";
import "./components/emoji-audio";

import "./systems/emoji-target";
import "./systems/emoji-button";

window.APP.scene.addEventListener("environment-scene-loaded", () => {
    window.APP.hubChannel.presence.onJoin(() => {
        APP.componentRegistry["player-info"].forEach((playerInfo) => {
            if (!playerInfo.socialVREmoji) {
                const audio = document.createElement("a-entity");
                audio.setAttribute("socialvr-emoji-audio", "");
                playerInfo.el.appendChild(audio);

                playerInfo.el.setAttribute("socialvr-emoji-target", "name", playerInfo.displayName);
                playerInfo.socialVREmoji = true;
            }
        });
      });
});