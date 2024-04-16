import { MentalProcess, WorkingMemory, useSoulMemory, useActions, useProcessMemory, usePerceptions } from "@opensouls/engine";
import { useProcessManager } from "@opensouls/engine";
import badFaithProcess, { isBadFaith } from "./mentalProcesses/badFaithProcess.js";
import { talk, think, state } from "./cognitiveFunctions/buildingBlocks.js";

const stageSpecificThought = [
  `Beautifully appreciate what has been said and forms a lovely thought.`, //and deeply appreciates everything: nature, beauty, the world, existence, etc
  `Tries to think about what the other person is thinking about.`,
  `Becomes super analytical, digging really deep into whats been said.`,
  `Gets super fixated on the interlocutor's tone and takes offence from it.`,
]

//TODO vary this up a lil bit
const stageSpecificSpeech = [
  `Give a lowkey response to what has last been said, disregarding they were thinking about.`,
  `Give a lowkey response to what has last been said, disregarding they were thinking about.`,
  `Give a lowkey response to what has last been said, disregarding they were thinking about.`,
  `Give a lowkey response to what has last been said, disregarding they were thinking about.`,
]

const stagesOfRelationship = [
  'I meet someone new',
  'we talk',
  'I fall in love',
  'they leave',
]

const initialProcess: MentalProcess = async ({ workingMemory }: { workingMemory: WorkingMemory }) => {

  const { dispatch, log } = useActions();
  const { wait } = useProcessManager();
  const cycle = useProcessMemory(0);
  const relationship = useSoulMemory("relationship", stagesOfRelationship[0])

  let memory = workingMemory;
  let stream;

  log($$(`scenario: {{scenario}}.`))

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
  if (decision) {
    log('bad faith!!!', decision);
    return [memory, badFaithProcess, { executeNow: true }]
  }

  log('thought', stageSpecificThought[cycle.current]);
  [memory, stream] = await think(memory, stageSpecificThought[cycle.current]);

  await wait(1000);

  log('speech', stageSpecificSpeech[cycle.current]);
  [memory, stream] = await talk(memory, stageSpecificSpeech[cycle.current]);

  //check if cycle should be added
  cycle.current = (cycle.current + 1) % 4;
  state(memory, { cycle: cycle.current });

  //TODO schedule some extra bonus messages here 

  return memory;

};

export default initialProcess;


// const emotion = useSoulMemory("emotion", '😐')
//emotions, maybe explore more later
// [, stream] = await emojiEmotion(memory,
//   `How are you feeling at this exact moment? Your last emotion was ${emotion.current}`,
//   { stream: false, model: "quality" });
// emotion.current = stream;
// dispatch({name: workingMemory.soulName, action: "feels", content: stream});

