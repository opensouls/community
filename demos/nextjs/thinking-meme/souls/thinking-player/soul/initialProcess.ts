import { MentalProcess, WorkingMemory, useSoulMemory, useActions, useProcessMemory, usePerceptions } from "@opensouls/engine";
import { useBlueprintStore, useOrganizationStore, useProcessManager } from "@opensouls/engine";
import externalDialog from "./lib/externalDialog.js";
import internalMonologue from "./lib/internalMonologue.js";
import emojiEmotion from "./lib/emojiEmotion.js";
import mentalQuery from "./lib/mentalQuery.js";
import useBadFaith, { isBadFaith, branchBadFaith } from "./mentalProcesses/useBadFaith.js";
import useSilentTreatment from "./mentalProcesses/useSilentTreatment.js";
import useMultiDialog from "./mentalProcesses/useMultiDialog.js";
import conversationCycle from "./conversationCycle.js";
import { talk, think } from "./lib/buildingBlocks.js";

const initialProcess: MentalProcess = async ({ workingMemory }: { workingMemory: WorkingMemory }) => {

  const { dispatch, log, scheduleEvent } = useActions();
  const cycle = useProcessMemory('0');

  //TODO start getting types?
  const relationship = useSoulMemory("relationship", 'I meet someone new')

  let memory = workingMemory;
  let stream;

  //TODO, discuss options to formalize this pattern
  //also think about how to call pendingPerceptions from functions
  
  //maybe add a param 'perceptionInterrupt' when it detects a pendingPerception after a cognitivestep
  //or maybe 'perceptionInterrupt' can also specifiy a process to run when they're interrupted ex. run 'can you stop interrupting me' 
  const { pendingPerceptions } = usePerceptions()
  if (pendingPerceptions.current.length > 0) {
    return undefined;
  }

  //TODO move this to perceptionProcessor so it always runs no matter what
  const [, decision] = await isBadFaith(memory);
  log('are we in bad faith?', decision);

  if (decision) { return [memory, useBadFaith, { executeNow: true }] }

  //can we just jump straight into the process? (this will reset things like invocations, etc.)
  //return [memory, useBadFaith, { executeNow: true }]

  //TODO with topper, how to return a process from branchBadFaith?
  // await branchBadFaith(memory);


  [memory, stream] = await think(memory,
    "Beautifully appreciate what has been said and forms lovely thought, a longish sentence.",
    { stream: true, model: "gpt-4-0125-preview" }
  );

  [memory, stream] = await talk(memory,
    "Give a lowkey response to what has last been said, disregarding what your thoughts about it were.",
    { stream: true, model: "gpt-4-0125-preview" }
  );




  //check if cycle should be added
  //TODO a store for base that automatically gets attached to all dispatches? 
  cycle.current = ((parseInt(cycle.current) + 1) % 8).toString();
  dispatch({
    name: workingMemory.soulName,
    action: "state",
    content: cycle.current,
    _metadata: { state: 'error' }
  });


  //schedule some extra bonus messages here 
  // return [memory, useMultiDialog, { executeNow: true }];

  // await memory.finished;
  return memory;

};

export default initialProcess;



//talk / think boilerplate
// [memory, stream] = await internalMonologue(memory,
//   "Beautifully appreciate what has been said and forms lovely thought, a longish sentence.",
//   { stream: true, model: "gpt-4-0125-preview" });
// dispatch({ name: workingMemory.soulName, action: "thinks", content: stream, _metadata: { state: 'thinks' } });

// [memory, stream] = await externalDialog(memory,
//   "Give a lowkey response at what has been said, disregarding what your thoughts about it were.",
//   { stream: true, model: "gpt-4-0125-preview", });
// speak(stream);

// const emotion = useSoulMemory("emotion", '😐')
//emotions, maybe explore more later
// [, stream] = await emojiEmotion(memory,
//   `How are you feeling at this exact moment? Your last emotion was ${emotion.current}`,
//   { stream: false, model: "gpt-4-0125-preview" });
// emotion.current = stream;
// dispatch({name: workingMemory.soulName, action: "feels", content: stream});

