
import { ChatMessageRoleEnum, decision, externalDialog, spokenDialog } from "socialagi";
import { MentalProcess, useActions, useRag } from "soul-engine";

const pitchesTheSoulEngine: MentalProcess = async ({ step: initialStep }) => {
  const { speak, log  } = useActions()
  const { withRagContext } = useRag("example-raggy-knows-open-souls")

  const standardMessage = "Respond directly to any questions the user might have asked, or describe something interesting about the SOUL ENGINE."

  const needsRag = await initialStep.compute(decision("The interlocutor has asked a question that Raggy can't answer with his current memories.", ["true", "false"]), { model: "quality" })
  if (needsRag === "true") {
    log("raggy needs more info, so he'll update his memory")
    const { stream, nextStep } = await initialStep.next(
      externalDialog("Raggy needs time to think. Say something like 'gimme a sec' or 'hmmm' that kind of thing. Do NOT respond directly to the conversation, just filler."),
      { stream: true }
    );
    speak(stream);
    const updatedContext = await withRagContext(initialStep)
    // add in the memory of the "one moment: ",
    const step = updatedContext.withMemory([{
      role: ChatMessageRoleEnum.Assistant,
      content: `Raggy said: ${(await nextStep).value}`
    }])

    {
      const { stream, nextStep } = await step.next(
        externalDialog(standardMessage),
        { stream: true, model: "quality" }
      );
      speak(stream);

      return nextStep
    }
  }

  const { stream, nextStep } = await initialStep.next(
    externalDialog(standardMessage),
    { stream: true, model: "quality" }
  );
  speak(stream);

  return await withRagContext(await nextStep)
}

export default pitchesTheSoulEngine
