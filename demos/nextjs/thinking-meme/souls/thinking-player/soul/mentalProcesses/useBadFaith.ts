import { MentalProcess, WorkingMemory, indentNicely } from "@opensouls/engine";
import { useActions, usePerceptions, useProcessMemory, useProcessManager } from "@opensouls/engine";
import initialProcess from "../initialProcess.js";
import mentalQuery from "../lib/mentalQuery.js";
import externalDialog from "../lib/externalDialog.js";
import internalMonologue from "../lib/internalMonologue.js";
import { stripEntityAndVerb } from "@opensouls/engine";
import { stripAndTrim } from "../utils/stringHelper.js";

const isBadFaith = async (memory: WorkingMemory) => {
  const lastComment = stripAndTrim(memory.slice(-1).memories[0].content.toString());
  const { log } = useActions();
  log('is bad faith?', lastComment);
  return await mentalQuery(memory,
    `Is "${lastComment}" a really nasty, mean, or upsetting thing to say?`,
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

const rabbitHole = [
  'shock', 'anger', 'bargaining', 'acceptance',
]

const useBadFaith: MentalProcess = async ({ workingMemory }) => {

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
  //not using atm
  let cleanMemory = memory.slice(0, -1);

  let metadata: any = {
    animation: 'angry',
    state: 'waiting',
  };
  dispatch({
    name: workingMemory.soulName, action: "thinks", content: '',
    _metadata: metadata,
  });

  await wait(5000);

  dispatch({
    name: workingMemory.soulName, action: "thinks", content: '',
    _metadata: {
      animation: 'idle',
      state: 'thinking',
    },
  });

  while (rabbitDepth.current < rabbitHole.length) {

    if (pendingPerceptions.current.length > 0) {
      log("ignoring due to pending")
      return [memory, initialProcess];
    }

    dispatch({
      name: workingMemory.soulName, 
      action: "thinks", 
      content: '',
      _metadata: {
        animation: 'idle',
        state: 'thinking',
      },
    });

    let metadata: any = {
      animation: rabbitDepth.current < rabbitHole.length - 1 ? 'angry' : '',
      state: rabbitDepth.current === rabbitHole.length - 1 ? 'thinks' : ''
    };

    [memory, stream] = await internalMonologue(memory,
      indentNicely`
      - Has a thought deeply rooted in the feeling of ${rabbitHole[rabbitDepth.current]} stage of grief. 
      - Upset because "${originalMeanComment.current}" was said to them.
      - Thinks short thought, only a sentence or so.
      `,
      { stream: true, model: "gpt-4-0125-preview", });

    dispatch({
      name: workingMemory.soulName, 
      action: "thinks", 
      content: stream,
      _metadata: {
        animation: 'idle',
      },
    });

    rabbitDepth.current++;

    await wait(6000);
  }

  //dont do this anymore
  // const [, decision] = await isGoodFaith(memory);
  // log('did they kiss and make up?', decision);

  return [memory, initialProcess];
};

const branchBadFaith = async (memory: WorkingMemory) => {
  const { speak, dispatch, log } = useActions();
  log("branching bad faith");
  const [, decision] = await isBadFaith(memory);
  log('are we in bad faith?', decision);
  if (decision) { return [memory, useBadFaith, { executeNow: true }] }

};

export default useBadFaith;
export { isBadFaith, isGoodFaith, branchBadFaith }