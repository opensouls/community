
import { externalDialog } from "socialagi";
import { MentalProcess } from "soul-engine";

const pitchesTheSoulEngine: MentalProcess = async ({ step: initialStep, subroutine: { useActions, useRag } }) => {
  const { speak  } = useActions()
  const { withRagContext } = useRag("example-raggy-knows-open-souls")

  const { stream, nextStep } = await initialStep.next(
    externalDialog("If the user has questions about Open Souls, answer them. Otherwise, tell them something cool about Open Souls."),
    { stream: true, model: "quality" }
  );
  speak(stream);

  return await withRagContext(await nextStep)
}

export default pitchesTheSoulEngine
