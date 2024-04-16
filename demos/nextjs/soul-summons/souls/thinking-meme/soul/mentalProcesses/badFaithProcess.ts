import { MentalProcess, WorkingMemory, indentNicely } from "@opensouls/engine";
import { useActions, usePerceptions, useProcessMemory, useProcessManager } from "@opensouls/engine";
import initialProcess from "../initialProcess.js";
import mentalQuery from "../lib/mentalQuery.js";
import externalDialog from "../lib/externalDialog.js";
import internalMonologue from "../lib/internalMonologue.js";
import { stripEntityAndVerb } from "@opensouls/engine";
import { stripAndTrim } from "../utils/stringHelper.js";
import { think, state } from "../cognitiveFunctions/buildingBlocks.js";

const rabbitHole = [
  'shock', 'bargaining', 'acceptance',
]

const isBadFaith = async (memory: WorkingMemory) => {

  const lastComment = stripAndTrim(memory.slice(-1).memories[0].content.toString());
  const { log } = useActions();

  //using

  log('is bad faith?', lastComment);
  return await mentalQuery(memory,
    `"${lastComment}" was said about me AND was a really nasty, mean, upsetting, or unexpected thing.`,
    { model: "quality" }
  );
}

const isGoodFaith = async (memory: WorkingMemory) => {
  const lastComment = memory.slice(-1).memories[0].content;
  const { log } = useActions();
  log('is good faith?', lastComment);
  return await mentalQuery(memory,
    "Something nice and kind was said to you.",
  );
}

const badFaithProcess: MentalProcess = async ({ workingMemory }) => {

  let memory = workingMemory;
  let stream;

  const { speak, dispatch, log } = useActions();
  const { wait } = useProcessManager()
  const { pendingPerceptions } = usePerceptions()

  log("bad faith time")

  const originalMeanComment = useProcessMemory(memory.slice(-1).memories[0].content);
  const rabbitDepth = useProcessMemory(0);
  log('mean comment', originalMeanComment.current);

  //discard the offending message (we forget it)
  //we might have to say this so it doesnt cause lingering refusals?
  let cleanMemory = memory.slice(0, -1);

  state(memory, {
    canSpeak: false,
    animation: 'angry',
    state: 'waiting',
  });

  await wait(5000);

  while (rabbitDepth.current < rabbitHole.length) {

    state(memory, {
      animation: 'idle',
      state: 'thinking',
    });

    if (pendingPerceptions.current.length > 0) {
      log("ignoring due to pending")
      return [memory, initialProcess];
    }

    [memory, stream] = await think(memory,
      indentNicely`
      - Has a thought deeply rooted in the feeling of ${rabbitHole[rabbitDepth.current]} stage of grief. 
      - Upset because "${originalMeanComment.current}" was said to them.
      - Thinks short thought, only a sentence or so.
      `);

    rabbitDepth.current++;

    await wait(4000);
  }

  state(memory, {
    canSpeak: true,
    state: 'waiting',
  });

  return [memory, initialProcess];
};

export default badFaithProcess;
export { isBadFaith, isGoodFaith }