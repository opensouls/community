import { MentalProcess, WorkingMemory, indentNicely, useActions, useProcessMemory, useProcessManager, usePerceptions } from "@opensouls/engine";
import externalDialog from "./lib/externalDialog.js";
import internalMonologue from "./lib/internalMonologue.js";

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
  
    await memory.finished;
    return memory;
  };