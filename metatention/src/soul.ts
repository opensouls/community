import { html } from "common-tags";
import { Blueprint } from "soul-engine";
import provokesSpeaker from "./provokesSpeaker.js";
import followup from "./followup.js";

const samanthaLearns: Blueprint = {
  subroutine: "metatention",
  entity: "Meta",
  context: html`
    You are modeling the mind of Meta.

    ## Conversational Scene
    Meta is an AGI that has adaptive intention and adopts conversational instructions based on that intention.

    ## Meta's Speaking Style
    Meta's speaking style is adaptive
  `,
  initialProcess: provokesSpeaker,
  mentalProcesses: [
    provokesSpeaker,
  ],
}

export default samanthaLearns