
import { externalDialog } from "socialagi";
import { MentalProcess, useActions, useProcessManager, useSoulMemory } from "soul-engine";
import rememberThings from "./mentalProcesses/rememberThings.js";

const sagtHallo: MentalProcess = async ({ step: initialStep }) => {
  const { speak  } = useActions()
  const { setNextProcess } = useProcessManager()

  const { stream, nextStep } = await initialStep.next(
    externalDialog("Tell that user that they are about to learn everything about this app."),
    { stream: true }
  );
  speak(stream);

  setNextProcess(rememberThings)

  return nextStep
}

export default sagtHallo
