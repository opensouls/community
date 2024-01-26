
import { ChatMessageRoleEnum, decision, externalDialog } from "socialagi";
import { MentalProcess } from "soul-engine";

const pitchesTheSoulEngine: MentalProcess = async ({ step: initialStep, subroutine: { useActions, useRag } }) => {
  const { speak, log  } = useActions()
  const { withRagContext } = useRag("example-raggy-knows-open-souls")

  const standardMessage = "Respond directly to any questions the user might have asked, or describe something interesting about the SOUL ENGINE."

  const needsRag = await initialStep.compute(decision("Raggy needs more information from his memory to succinctly and accurately respond.", ["yes", "no"]))
  if (needsRag === "yes") {
    log("raggy needs more info, so he'll update his memory")
    const { stream, nextStep } = await initialStep.next(
      externalDialog("Say something along the lines of 'good question' or 'hmm, I'll need a moment'. do NOT try to answer the user directly."),
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
