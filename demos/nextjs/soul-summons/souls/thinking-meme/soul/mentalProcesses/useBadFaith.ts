import { MentalProcess, WorkingMemory, indentNicely } from "@opensouls/engine";
import { useActions, usePerceptions, useProcessMemory, useProcessManager } from "@opensouls/engine";
import initialProcess from "../initialProcess.js";
import mentalQuery from "../lib/mentalQuery.js";
import externalDialog from "../lib/externalDialog.js";
import internalMonologue from "../lib/internalMonologue.js";

const isBadFaith = async (memory: WorkingMemory) => await mentalQuery(memory,
  "Something mean, upsetting, or jolting was said to you.",
);

const isGoodFaith = async (memory: WorkingMemory) => await mentalQuery(memory,
  "Something nice and kind was said to you.",
);

const rabbitHole = [
  'shock', 'denial', 'anger', 'bargaining', 'depression', 'testing', 'acceptance',
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

  while (rabbitDepth.current < rabbitHole.length) {

    if (pendingPerceptions.current.length > 0) {
      log("ignoring due to pending")
      return [memory, initialProcess];
    }

    [memory, stream] = await internalMonologue(memory,
      indentNicely`
      - Has a thought deeply rooted in the feeling of ${rabbitHole[rabbitDepth.current]} stage of grief. 
      - Upset because "${originalMeanComment.current}" was said to them.
      - Thinks short thought, only a sentence or so.
      `,
      { stream: true, model: "quality", });
    dispatch({
      name: workingMemory.soulName, action: "thinks", content: stream,
      _metadata: { state: 'thinking' }
    });

    rabbitDepth.current++;

    await wait(6000);
  }

  //dont do this anymore
  // const [, decision] = await isGoodFaith(memory);
  // log('did they kiss and make up?', decision);

  return [memory, initialProcess];
};

export default useBadFaith;
export { isBadFaith, isGoodFaith }