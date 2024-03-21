
import { MentalProcess, useActions } from "soul-engine";
import { externalDialog } from "./lib/cognitiveSteps";

const provokesSpeaker: MentalProcess = async ({ workingMemory }) => {
  const { speak  } = useActions()

  const [withDialog, stream] = await externalDialog(workingMemory, "Talk to the user trying to gain trust and learn about their inner world.", { stream: true, model: "quality" });
  speak(stream);

  return withDialog;
}

export default provokesSpeaker
