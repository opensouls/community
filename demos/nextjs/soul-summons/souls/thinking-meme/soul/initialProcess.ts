import { MentalProcess, WorkingMemory, indentNicely, useActions, useProcessMemory, usePerceptions } from "@opensouls/engine";
import { useBlueprintStore, useOrganizationStore, useProcessManager } from "@opensouls/engine";
import externalDialog from "./lib/externalDialog.js";
import internalMonologue from "./lib/internalMonologue.js";
import emojiEmotion from "./lib/emojiEmotion.js";
import mentalQuery from "./lib/mentalQuery.js";
import useBadFaith, { isBadFaith, branchBadFaith } from "./mentalProcesses/useBadFaith.js";
import useMultiDialog from "./mentalProcesses/useMultiDialog.js";
import conversationCycle from "./conversationCycle.js";


const initialProcess: MentalProcess = async ({ workingMemory }) => {

  const { speak, dispatch, log } = useActions();
  const { wait } = useProcessManager()
  const cycle = useProcessMemory('0');
  const emotion = useProcessMemory('😐');
  //TODO environment variables or memory?
  const relationship = useBlueprintStore('relationship');

  let memory = workingMemory;
  let stream;

  const { pendingPerceptions } = usePerceptions()
  if (pendingPerceptions.current.length > 0) {
    log("ignoring due to pending")
    return undefined;
  }

  //let the client know we are listening to this perception
  dispatch({ name: workingMemory.soulName, action: "hears", content: '*starts listening*' });

  //decide if the speaker is in bad faith
  //TODO move this to perceptionProcessor so it always runs no matter what
  const [, decision] = await isBadFaith(memory);
  log('are we in bad faith?', decision);
  if (decision) { return [memory, useBadFaith, { executeNow: true }] }

  //TODO with topper, how to return a process from branchBadFaith?
  // await branchBadFaith(memory);

  //do a thought asap before making decisions so they at least get some text
  [memory, stream] = await internalMonologue(memory,
    "Beautifully appreciate what has been said and forms lovely thought, a longish sentence.",
    { stream: true, model: "quality" });

  log("thinking");
  dispatch({ name: workingMemory.soulName, action: "thinks", content: stream, _metadata: { state: 'thinks' } });

  [memory, stream] = await externalDialog(memory,
    "Give a lowkey response at what has been said, disregarding what your thoughts about it were.",
    { stream: true, model: "quality", });
  speak(stream);


  //check if cycle should be added
  cycle.current = ((parseInt(cycle.current) + 1) % 4).toString();
  dispatch({ name: workingMemory.soulName, action: "state", content: cycle.current, _metadata: { state: 'error' }  });


  //schedule some extra bonus messages here 
  // return [memory, useMultiDialog, { executeNow: true }];


  // await memory.finished;
  return memory;


  
  //emotions, maybe explore more later
  // [, stream] = await emojiEmotion(memory,
  //   `How are you feeling at this exact moment? Your last emotion was ${emotion.current}`,
  //   { stream: false, model: "quality" });
  // emotion.current = stream;
  // dispatch({name: workingMemory.soulName, action: "feels", content: stream});


};

export default initialProcess;
