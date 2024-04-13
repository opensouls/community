import { MentalProcess, WorkingMemory, useSoulMemory, useActions, useProcessMemory, usePerceptions } from "@opensouls/engine";
import { useBlueprintStore, useOrganizationStore, useProcessManager } from "@opensouls/engine";
import badFaithProcess, { isBadFaith, branchBadFaith } from "./mentalProcesses/badFaithProcess.js";
import { talk, think, state } from "./cognitiveFunctions/buildingBlocks.js";

const stagesOfRelationship = [
  'I meet someone new',
  'we talk',
  'I fall in love',
  'they leave',
]



const stageSpecificThought = [
  `Beautifully appreciate what has been said and forms a lovely thought.`, //and deeply appreciates everything: nature, beauty, the world, existence, etc
  `Tries to think about what the other person is thinking about.`,
  `Becomes super analytical, digging really deep into whats been said.`,
  `Gets super fixated on the interlocutor's tone and takes offence from it.`,
]

const stageSpecificSpeech = [
  `Give a lowkey response to what has last been said, disregarding they were thinking about.`,
  `Give a lowkey response to what has last been said, disregarding they were thinking about.`,
  `Give a lowkey response to what has last been said, disregarding they were thinking about.`,
  `Give a lowkey response to what has last been said, disregarding they were thinking about.`,
]

const initialProcess: MentalProcess = async ({ workingMemory }: { workingMemory: WorkingMemory }) => {

  const { dispatch, log } = useActions();
  const { wait } = useProcessManager();
  const cycle = useProcessMemory(0);

  //TODO start using common folder for types shared with client (but in a way it doesn't break community library support?)
  const relationship = useSoulMemory("relationship", stagesOfRelationship[0])

  let memory = workingMemory;
  let stream;

  log($$(`scenario: {{scenario}}.`))

  //TODO, discuss options to formalize this pattern
  //maybe add a param 'perceptionInterrupt' when it detects a pendingPerception after a cognitivestep
  //or maybe 'perceptionInterrupt' can also specifiy a process to run when they're interrupted ex. run 'can you stop interrupting me' 
  const { pendingPerceptions } = usePerceptions()
  if (pendingPerceptions.current.length > 0) {
    return undefined;
  }

  //reset state when entering the initial process
  state(memory, {
    canSpeak: true,
    animation: 'idle',
    state: 'thinking',
  });


  //TODO move this to perceptionProcessor so it always runs no matter what
  const [, decision] = await isBadFaith(memory);
  log('are we in bad faith?', decision);

  if (decision) { return [memory, badFaithProcess, { executeNow: true }] }

  //process invocations/memory
  //return [memory, badFaithProcess, { executeNow: true, interruptable: true, returnTo: initialProcess }]

  //could we just jump straight into the process? (this will reset things like invocations, etc.)
  //do we even need this? why do we need this? 

  //would be useful to have invocations/other things get tracked by other functions
  //we don't have access to those with cognitiveFunctions
  //ex. I can run some process in the middle that changes some variables on itself and then comes back to the original process
  //return [memory, badFaithProcess, { executeNow: true, interruptable: true, returnTo: initialProcess}]


  log('thought', stageSpecificThought[cycle.current]);
  [memory, stream] = await think(memory, stageSpecificThought[cycle.current]);

  await wait(1000);

  log('speech', stageSpecificSpeech[cycle.current]);
  [memory, stream] = await talk(memory, stageSpecificSpeech[cycle.current]);

  //check if cycle should be added
  //TODO a metadata object that automatically gets attached to all dispatches? 
  cycle.current = (cycle.current + 1) % 4;
  state(memory, { cycle: cycle.current });

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

