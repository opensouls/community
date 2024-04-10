import { MentalProcess, WorkingMemory, indentNicely, useActions, useProcessMemory, usePerceptions } from "@opensouls/engine";
import { useBlueprintStore, useOrganizationStore, useProcessManager } from "@opensouls/engine";
import externalDialog from "./lib/externalDialog.js";
import internalMonologue from "./lib/internalMonologue.js";
import emojiEmotion from "./lib/emojiEmotion.js";
import mentalQuery from "./lib/mentalQuery.js";
import useBadFaith, { isBadFaith } from "./useBadFaith.js";
import useMultiDialog from "./processes/useMultiDialog.js";

const initialProcess: MentalProcess = async ({ workingMemory }) => {

  const { speak, dispatch, log } = useActions();
  const { wait } = useProcessManager()
  const cycle = useProcessMemory('0');
  const emotion = useProcessMemory('😐');

  let memory = workingMemory;
  let stream;

  // // log("liked things: " + JSON.stringify(soul.env.likedThings))
  // // log("entity name: " + workingMemory.soulName)
  // // speak($$("I like {{likedThings}}."))

  const { pendingPerceptions } = usePerceptions()

  if (pendingPerceptions.current.length > 0) {
    log("ignoring due to pending")
    return undefined;
  }

  //let the client know we are listening to this perception
  dispatch({ name: workingMemory.soulName,action: "hears",content: '*starts listening*'});

  log('process switch');
  return [memory, useBadFaith, { executeNow: true }];
  return [memory, useMultiDialog, { executeNow: true }];

  //do a thought asap before making decisions so they at least get some text
  [memory, stream] = await internalMonologue(memory,
    "Try to model the mind of the person speaking and beautifully appreciate what has been said from a shared perspective",
    { stream: true, model: "quality" });

  log("thinking");
  dispatch({ name: workingMemory.soulName, action: "thinks", content: stream });

  //decide if the speaker is in bad faith
  //kick out to process
  const [, decision] = await isBadFaith(memory);
  log('are we in bad faith?', decision);
  if (decision) { return [memory, useBadFaith, { executeNow: true }] }

  //emotions (take too long to process)
  // [, stream] = await emojiEmotion(memory,
  //   `How are you feeling at this exact moment? Your last emotion was ${emotion.current}`,
  //   { stream: false, model: "quality" });
  // emotion.current = stream;
  // dispatch({name: workingMemory.soulName, action: "feels", content: stream});

  //quick yes / no on whether to respond
  // const [, shouldSpeak] = await mentalQuery(memory, requiresResponse, { model: "quality" });
  // log("Should speak:", shouldSpeak);

  [memory, stream] = await externalDialog(memory,
    "Give a lowkey response at what has been said, show the smallest glimmer about what you've been thinking about.",
    { stream: true, model: "quality", });
  speak(stream);

  //increase the cycle
  cycle.current = ((parseInt(cycle.current) + 1) % 4).toString();
  dispatch({ name: workingMemory.soulName, action: "state", content: cycle.current });

  await memory.finished;
  return memory;
};

export default initialProcess;
