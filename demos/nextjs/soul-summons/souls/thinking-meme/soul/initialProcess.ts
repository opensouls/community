import { MentalProcess, WorkingMemory, useSoulMemory, useActions, useProcessMemory, usePerceptions } from "@opensouls/engine";
import { useBlueprintStore, useOrganizationStore, useProcessManager } from "@opensouls/engine";
import useBadFaith, { isBadFaith, branchBadFaith} from "./mentalProcesses/useBadFaith.js";
import useSilentTreatment from "./mentalProcesses/useSilentTreatment.js";
import { talk, think } from "./lib/buildingBlocks.js";

const stagesOfRelationship = [
  'I meet someone new',
  'we talk',
  'I fall in love',
  'they leave',
]

const stageSpecificThought = [
  `Beautifully appreciate what has been said and forms lovely thought.`, //and deeply appreciates everything: nature, beauty, the world, existence, etc
  `Wonders exactly whats on the interlocutor's mind, what they are thinking exactly in that moment.`,
  `Gets super fixated on the interlocutor's tone and takes offence from it.`,
  `Lightens up and thinks a beautiful thought about the person they're talking to.`,
]

const stageSpecificSpeech = [
  `Give a lowkey response to what has last been said, disregarding they were thinking about.`,
  `Give a lowkey response to what has last been said, disregarding they were thinking about.`,
  `Give a lowkey response to what has last been said, disregarding they were thinking about.`,
  `Give a lowkey response to what has last been said, disregarding they were thinking about.`,
]

const initialProcess: MentalProcess = async ({ workingMemory }: { workingMemory: WorkingMemory }) => {

  const { dispatch, log, scheduleEvent } = useActions();
  const cycle = useProcessMemory(0);

  //TODO get client types from some common folder?
  const relationship = useSoulMemory("relationship", stagesOfRelationship[0])

  let memory = workingMemory;
  let stream;

  //TODO, discuss options to formalize this pattern
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

  //TODO with topper, how to return a process from branchBadFaith?
  // await branchBadFaith(memory);


  log('thought', stageSpecificThought[cycle.current]);
  [memory, stream] = await think(memory,
    stageSpecificThought[cycle.current],
    { stream: true, model: "quality" }
  );

  log('speech', stageSpecificSpeech[cycle.current]);
  [memory, stream] = await talk(memory,
    stageSpecificSpeech[cycle.current],
    { stream: true, model: "quality" }
  );
  
  //check if cycle should be added
  //TODO a store for base that automatically gets attached to all dispatches? 
  cycle.current = (cycle.current + 1) % 4;
  dispatch({
    name: workingMemory.soulName,
    action: "state",
    content: cycle.current.toString(),
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
//   { stream: true, model: "quality" });
// dispatch({ name: workingMemory.soulName, action: "thinks", content: stream, _metadata: { state: 'thinks' } });

// [memory, stream] = await externalDialog(memory,
//   "Give a lowkey response at what has been said, disregarding what your thoughts about it were.",
//   { stream: true, model: "quality", });
// speak(stream);

// const emotion = useSoulMemory("emotion", '😐')
//emotions, maybe explore more later
// [, stream] = await emojiEmotion(memory,
//   `How are you feeling at this exact moment? Your last emotion was ${emotion.current}`,
//   { stream: false, model: "quality" });
// emotion.current = stream;
// dispatch({name: workingMemory.soulName, action: "feels", content: stream});

