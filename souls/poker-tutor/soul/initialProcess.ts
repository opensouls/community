import { MentalProcess, useActions, useProcessManager } from "@opensouls/engine";
import assists from "./mentalProcesses/assists.js";
import externalDialog from "./cognitiveSteps/externalDialog.js";

const playsPokerWithUser: MentalProcess = async ({ workingMemory: memory }) => {
  const { speak } = useActions();
  const { setNextProcess } = useProcessManager();

  let stream;

  [memory, stream] = await externalDialog(memory, "Greets or continues a normal conversation with the user.", {
    stream: true,
    model: "quality",
  });
  speak(stream);

  await memory.finished;

  setNextProcess(assists);

  return memory;
};

export default playsPokerWithUser;
