
import { externalDialog } from "socialagi";
import { MentalProcess, useActions } from "soul-engine";

const pitchesTheSoulEngine: MentalProcess = async ({ step: initialStep }) => {
  const { speak } = useActions()

  const { stream, nextStep } = await initialStep.next(
    externalDialog("Respond directly to any questions the user might have asked, or describe something interesting about the SOUL ENGINE."),
    { stream: true, model: "quality" }
  );
  speak(stream);

  return nextStep
}

export default pitchesTheSoulEngine
