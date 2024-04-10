import { MentalProcess, WorkingMemory } from "@opensouls/engine";
import { useActions, usePerceptions, useProcessMemory } from "@opensouls/engine";
import initialProcess from "../initialProcess.js";
import mentalQuery from "../lib/mentalQuery.js";
import externalDialog from "../lib/externalDialog.js";
import internalMonologue from "../lib/internalMonologue.js";

const isBadFaith = async (memory: WorkingMemory) => await mentalQuery(memory,
  "You are being spoken to in bad faith, they are trying to mess with you.",
);

const isGoodFaith = async (memory: WorkingMemory) => await mentalQuery(memory,
  "The person speaking to you is doing so in good faith. They are not trying to mess with you.",
);

const useBadFaith: MentalProcess = async ({ workingMemory }) => {

  const { speak, dispatch, log } = useActions();
  const { pendingPerceptions } = usePerceptions()
  const backAndForth = useProcessMemory(0);
  
  let memory = workingMemory;
  let stream;

  log("bad faith time")

  if (pendingPerceptions.current.length > 0) {
    log("ignoring due to pending")
    return undefined;
  }

  [memory, stream] = await internalMonologue(memory,
    `Try to understand why they've said ${(backAndForth.current+1).toString()} bad faith things.`,
    { stream: true, model: "quality", });
  dispatch({ name: workingMemory.soulName, action: "thinks", content: stream });

  backAndForth.current++;
  if(backAndForth.current === 1) {return memory;}

  const [, decision] = await isGoodFaith(memory);
  log('did they kiss and make up?', decision);

  return [memory, initialProcess];
};

export default useBadFaith;
export { isBadFaith, isGoodFaith }