import { MentalProcess, WorkingMemory, indentNicely, useActions, useProcessMemory, usePerceptions } from "@opensouls/engine";
import { useBlueprintStore, useOrganizationStore, useProcessManager } from "@opensouls/engine";
import externalDialog from "./lib/externalDialog.js";
import internalMonologue from "./lib/internalMonologue.js";
import mentalQuery from "./lib/mentalQuery.js";

const initialProcess: MentalProcess = async ({ workingMemory }) => {

  const { speak, dispatch, log } = useActions();
  const { wait } = useProcessManager()
  // const fragmentNo = useProcessMemory(0);

  let memory = workingMemory;
  let stream;


  const { pendingPerceptions } = usePerceptions()

  if (pendingPerceptions.current.length > 0) {
    // simply ignore this then
    log("ignoring due to pending")
    return undefined;
  }

  log('listening');
  dispatch({
    name: workingMemory.soulName,
    action: "hears",
    content: 'Time to listen and ponder deeply.'
  });


  // // log("liked things: " + JSON.stringify(soul.env.likedThings))
  // // log("entity name: " + workingMemory.soulName)
  // // speak($$("I like {{likedThings}}."))

  //do a thought
  [memory, stream] = await internalMonologue(memory, "Find out what the heck is being said..", {
    stream: false,
    model: "quality",
  });

  log("thinking");
  dispatch({
    name: workingMemory.soulName,
    action: "thinks",
    content: stream
  });


  await wait(2000);

  //quick yes / no on whether to respond
  // const [, shouldSpeak] = await mentalQuery(memory, requiresResponse, { model: "quality" });
  // log("Should speak:", shouldSpeak);

  [memory, stream] = await externalDialog(memory, "Try to say something about what you've been thinking about.", {
    stream: false,
    model: "quality",
  });

  speak(stream);


  await memory.finished;
  return memory;
};


export default initialProcess;
