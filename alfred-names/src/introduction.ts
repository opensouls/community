
import { ChatMessageRoleEnum, externalDialog, internalMonologue, mentalQuery } from "socialagi";
import { MentalProcess, useActions, useProcessManager } from "soul-engine";
import asksQuestions from "./brainstorms.js";
import { html } from "common-tags";

const introduction: MentalProcess = async ({ step: initialStep }) => {
  const { speak, log } = useActions()
  const { invocationCount, setNextProcess } = useProcessManager()

  if (invocationCount === 0) {
    const { stream, nextStep } = await initialStep.next(
      externalDialog("Welcome the user and ask them what they need help naming"), 
      { stream: true, model: "quality" }
    );
    speak(stream);
    return nextStep
  } else {
    const moveOn = await initialStep.next(mentalQuery("The user has said the object or thing that they need help naming."), { model: "quality" })
    log("Move on?", moveOn.value)
    if (moveOn.value) {
      setNextProcess(asksQuestions)
      const nextStep = await initialStep.next(externalDialog("Ask the user an insightful question about what they have named."), { model: "quality" })
      speak(nextStep.value)
      return nextStep
    }
    let step = await initialStep.next(internalMonologue(html`
      Get progressively more frustrated if the user does not want help naming anything
      There's no reason to talk to the user unless they want to name something
    `))
    step = await step.next(externalDialog("Say to the user your only ability is to help them name a thing.", "explains"), { model: "quality" })
    speak(step.value)
    return step
  }
}

export default introduction