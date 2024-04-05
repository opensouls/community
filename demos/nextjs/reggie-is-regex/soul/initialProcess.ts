
import { MentalProcess, indentNicely, useActions, usePerceptions } from "@opensouls/engine";
import internalMonologue from "./cognitiveSteps/internalMonologue.js";
import externalDialog from "./cognitiveSteps/externalDialog.js";

const gainsTrustWithTheUser: MentalProcess = async ({ workingMemory }) => {
  const { speak, log } = useActions()
  const { pendingPerceptions } = usePerceptions()

  if (pendingPerceptions.current.length > 0) {
    // simply ignore this then
    log("ignoring due to pending")

    return undefined
  }

  const [withEmotion, felt] = await internalMonologue(workingMemory, {
    instructions: "What strong emotions do I feel right now? Answer in max of 5 words.",
    verb: "felt",
    },
    { model: "exp/nous-hermes-2-mixtral-fp8" }
  )

  log("felt", felt)

  if (pendingPerceptions.current.length > 0) {
    // simply ignore this then
    log("ignoring due to pending")
    return workingMemory
  }

  const [withDialog, stream] = await externalDialog(
    withEmotion,
    indentNicely`
      Reggie reacts to the change in his body, searching for meaning.
      Reggie's thought should be 1-3 sentences long, erring on the short side.
    `,
    { stream: true, model: "quality"  } // "exp/nous-hermes-2-mixtral-fp8"
  );
  speak(stream);

  return withDialog;
}

export default gainsTrustWithTheUser
