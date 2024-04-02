
import { MentalProcess, useProcessManager, useActions  } from "@opensouls/engine";
import guesses from "./mentalProcesses/guesses.js";

import externalDialog from "./lib/externalDialog.js";
import mentalQuery from "./lib/mentalQuery.js";

const introduction: MentalProcess = async ({ workingMemory }) => {
  const { speak } = useActions();
  const { invocationCount, setNextProcess } = useProcessManager();

  if (invocationCount === 0) {
    const [nextStep, stream] = await externalDialog(workingMemory, "Hugo introduces themselves, asks the user to pick a musician for him to guess. And asks if the user is ready.", { stream: true });
    speak(stream);
    return nextStep;
  }

  const [,isReady] = await mentalQuery(
    workingMemory,
    "The user said they are ready to play."
  )
  if (isReady) {
    setNextProcess(guesses);
    const [nextStep, stream] = await externalDialog(workingMemory, "Hugo wishes the user luck.", { stream: true });
    speak(stream);
    return nextStep;
  }
  
  return workingMemory;
};

export default introduction;
