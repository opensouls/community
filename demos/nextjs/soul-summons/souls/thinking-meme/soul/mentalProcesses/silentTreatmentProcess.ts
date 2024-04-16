import { MentalProcess } from "@opensouls/engine";
import { useActions, useProcessManager } from "@opensouls/engine";
import initialProcess from "../initialProcess.js";

const silentTreatmentProcess: MentalProcess = async ({ workingMemory }) => {

  let stream;

  const { dispatch, log } = useActions();
  const { wait } = useProcessManager()

  log("silent treatment")

  let metadata: any = {
    animation: 'angry',
    state: 'waiting',
  };

  dispatch({
    name: workingMemory.soulName, action: "says", content: '...',
    _metadata: metadata,
  });

  await wait(5000);

  dispatch({
    name: workingMemory.soulName, action: "says", content: '...',
    _metadata: {
      animation: 'idle',
      state: 'waiting',
    },
  });

  return [workingMemory, initialProcess];
};

export default silentTreatmentProcess;

