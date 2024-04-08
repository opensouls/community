import { MentalProcess, WorkingMemory, indentNicely, useActions, useProcessMemory, usePerceptions } from "@opensouls/engine";
import { useBlueprintStore, useOrganizationStore, useProcessManager} from "@opensouls/engine";
import decision from "./lib/decision.js";
import criteria from "./lib/thinking.js";
import externalDialog from "./lib/externalDialog.js";
import internalMonologue from "./lib/internalMonologue.js";
import mentalQuery from "./lib/mentalQuery.js";
import { requiresResponse, certaintyOfSoul } from "./soulBase.js";

const initialProcess: MentalProcess = async ({ workingMemory }) => {

  const { speak, log, dispatch } = useActions();
  const { wait } = useProcessManager()
  const { pendingPerceptions } = usePerceptions()

  if (pendingPerceptions.current.length > 0) {
    // simply ignore this then
    log("ignoring due to pending")
    return undefined
  }

  const soulState = useProcessMemory(certaintyOfSoul[0])
  const fragmentNo = useProcessMemory(0)

  let memory = workingMemory;
  let stream;

  // log("liked things: " + JSON.stringify(soul.env.likedThings))
  // log("entity name: " + workingMemory.soulName)
  // speak($$("I like {{likedThings}}."))

  const [, hasCriteria] = await criteria(memory, {
    description: `I have been summoned to a further stage, currently I am at the stage "${soulState}`,
    criteria: [
      `There was chanting`,
      `A bloodcurtling scream was emitted`,
      `Soft utterances of a prayer were heard`,
    ]
  }, { model: "quality" });

  log("criteria:", JSON.stringify(hasCriteria));
  dispatch({
    name: workingMemory.soulName,
    action: "thinks",
    content: hasCriteria.missingCriteria
  })

  //quick yes / no on whether to respond
  const [, shouldSpeak] = await mentalQuery(memory, requiresResponse, { model: "quality" });
  log("Should speak:", shouldSpeak);



  if (shouldSpeak) {
    [memory, stream] = await externalDialog(memory, "The prenatal soul makes a pronouncement about what stage of existence they are at.", {
      stream: false,
      model: "quality",
    });

    speak(stream);
  }


  await memory.finished;
  return memory;

  // if (intent === code || intent === info) {
  //   const [, canOutline] = await mentalQuery(
  //     memory,
  //     "CodeMonkey has enough information to write an outline of the code.",
  //     {
  //       model: "quality",
  //     }
  //   );

  //   if (canOutline) {
  //     return await withCodeOutline({ memory });
  //   } else {
  //     return await withMoreInformationRequest({ memory });
  //   }
  // } else if (intent === question) {
  //   log("Thinking about the user's question");
  //   [memory] = await internalMonologue(memory, "Think step by step about the answer to the user's question.", {
  //     model: "quality",
  //   });
  // }

  // [memory, stream] = await externalDialog(memory, "CodeMonkey answers the user's message.", {
  //   stream: true,
  //   model: "quality",
  // });

  // speak(stream);
  // await memory.finished;

  // return memory;
};


export default initialProcess;
