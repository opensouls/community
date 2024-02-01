
import { externalDialog } from "socialagi";
import { MentalProcess, useActions, useProcessManager, useSoulMemory } from "soul-engine";
import pitchesTheSoulEngine from "./mentalProcesses/pitchesTheSoulEngine.js";

const sagtHallo: MentalProcess = async ({ step: initialStep }) => {
  const { speak  } = useActions()
  const { setNextProcess } = useProcessManager()

  const { stream, nextStep } = await initialStep.next(
    externalDialog("Introduce yourself to the user, see if you can find their name."),
    { stream: true }
  );
  speak(stream);

  setNextProcess(pitchesTheSoulEngine)

  return nextStep
}

export default sagtHallo
