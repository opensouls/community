import { MentalProcess, WorkingMemory, indentNicely, useActions, useProcessMemory, usePerceptions } from "@opensouls/engine";
import { useBlueprintStore, useOrganizationStore, useProcessManager } from "@opensouls/engine";
import externalDialog from "./lib/externalDialog.js";
import internalMonologue from "./lib/internalMonologue.js";
import emojiEmotion from "./lib/emojiEmotion.js";
import mentalQuery from "./lib/mentalQuery.js";

const initialProcess: MentalProcess = async ({ workingMemory }) => {

  const { speak, dispatch, log } = useActions();
  const { wait } = useProcessManager()
  const emotion = useProcessMemory('😐');

  let memory = workingMemory;
  let stream;

  // // log("liked things: " + JSON.stringify(soul.env.likedThings))
  // // log("entity name: " + workingMemory.soulName)
  // // speak($$("I like {{likedThings}}."))

  const { pendingPerceptions } = usePerceptions()

  if (pendingPerceptions.current.length > 0) {
    // simply ignore this then
    log("ignoring due to pending")
    return undefined;
  }

  // log('listening');
  dispatch({
    name: workingMemory.soulName,
    action: "hears",
    content: '*starts listening*'
  });

  [, stream] = await emojiEmotion(memory, `How are you feeling at this exact moment? Your last emotion was ${emotion.current}`, {
    stream: false,
    model: "quality",
  });
  
  emotion.current = stream;

  dispatch({
    name: workingMemory.soulName,
    action: "feels",
    content: stream
  });

  //do a thought
  [memory, stream] = await internalMonologue(memory, "Try to model the mind of the person speaking and beautifully appreciate what has been said from a shared perspective", {
    stream: true,
    model: "quality",
  });

  log("thinking");
  dispatch({
    name: workingMemory.soulName,
    action: "thinks",
    content: stream
  });

  //quick yes / no on whether to respond
  // const [, shouldSpeak] = await mentalQuery(memory, requiresResponse, { model: "quality" });
  // log("Should speak:", shouldSpeak);

  [memory, stream] = await externalDialog(memory, "Give a lowkey response at what has been said, show the smallest glimmer about what you've been thinking about.", {
    stream: false,
    model: "quality",
  });

  speak(stream);


  await memory.finished;
  return memory;
};


export default initialProcess;
