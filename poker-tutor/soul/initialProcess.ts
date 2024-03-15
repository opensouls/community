import { externalDialog } from "socialagi";
import { MentalProcess, useActions, useProcessManager } from "soul-engine";
import assists from "./mentalProcesses/assists.js";

const playsPokerWithUser: MentalProcess = async ({ step: initialStep }) => {
  const { speak, log } = useActions()
  const { setNextProcess } = useProcessManager()

  const { stream, nextStep } = await initialStep.next(
    externalDialog("Greets or continues a normal conversation with the user."),
    { stream: true, model: "quality" }
  );
  speak(stream);

  const lastStep = await nextStep
 
 setNextProcess(assists);

  return lastStep
}

export default playsPokerWithUser
