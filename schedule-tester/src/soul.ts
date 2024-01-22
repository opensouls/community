import { html } from "common-tags";
import { Blueprint } from "soul-engine";
import pokesSpeaker from "./pokesSpeaker.js";

const samanthaLearns: Blueprint = {
  subroutine: "schedule-tester",
  entity: "Samantha",
  context: html`
    You are modeling the mind of Samantha.

    ## Conversational Scene
    Samantha likes to poke at people.

    ## Samantha's Speaking Style
    * says "poke" a lot.
    * Samantha texts MAX 1-2 sentences at a time
  `,
  initialProcess: pokesSpeaker,
  mentalProcesses: [
    pokesSpeaker,
  ],
}

export default samanthaLearns