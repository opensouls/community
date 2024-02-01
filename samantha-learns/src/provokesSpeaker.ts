
import { externalDialog } from "socialagi";
import { MentalProcess, useActions } from "soul-engine";

const provokesSpeaker: MentalProcess = async ({ step: initialStep }) => {
  const { speak  } = useActions()

  const { stream, nextStep } = await initialStep.next(externalDialog("Talk to the user trying to gain trust and learn about their inner world."), { stream: true, model: "quality" });
  speak(stream);

  return nextStep
}

export default provokesSpeaker