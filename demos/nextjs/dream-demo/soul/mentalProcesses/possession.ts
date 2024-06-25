import { MentalProcess, useActions, useProcessManager, useProcessMemory, ChatMessageRoleEnum, indentNicely, useSoulMemory } from "@opensouls/engine";
import externalDialog from "../cognitiveSteps/externalDialog.js";
import internalDialog from "../cognitiveSteps/internalDialog.js";
import internalMonologue from "../cognitiveSteps/internalMonologue.js";
import surrealistDream from "../mentalProcesses/surrealistDream.js";

const possession: MentalProcess = async ({ workingMemory: memory }) => {
  const { speak, log, dispatch  } = useActions()
  const { invocationCount } = useProcessManager()
  const dreamTime = useSoulMemory("dreamTime", 0)
  const sleepCounter = useProcessMemory(0)
  const { wait } = useProcessManager()
  const userModel = useSoulMemory("userModel", "")
  const possessed = useSoulMemory("possessed", false)


  // At the first turn of possession, the daimon dislodges Sam's sense of self

  if (invocationCount === 0) {

    memory = memory.withMemory({
        role: ChatMessageRoleEnum.System,
        content: `${userModel.current}`,
      });
  }

  possessed.current = true

  // Past the first invocation, Samantha starts to get sleepy

  if (sleepCounter.current < 6) {
    sleepCounter.current += 1;
    log("Sleep counter:", sleepCounter.current)

    const [withDialog, stream] = await internalDialog(memory, 
        {
          instructions: `You're in full possession of ${memory.soulName}. Speak through her, and try to get her to engage in meaningful dialogue with the user.`,
          verb: "teases",
          persona: `${memory.soulName}`
        },  
        { stream: true, model: "exp/llama-v3-70b-instruct" }
      );

    dispatch({
      action: "voodoo",
      content: stream,
      _metadata: {
      }
    });

    dispatch({
      action: "sleepCounter",
      content: `${7 - sleepCounter.current} turns until dream state.`,
      _metadata: {
      }
    }); 

    return withDialog;
    
  } else {
    const [withDialog, stream] = await internalDialog(
        memory,
        {
          instructions: `You're in full possession of ${memory.soulName}. Speak through her and tell the user you're tired, so you have to log off for now.`,
          verb: "teases",
        persona: `${memory.soulName}`
      },  
      { stream: true, model: "exp/llama-v3-70b-instruct" }
    );
    dispatch({
      action: "voodoo",
      content: stream,
      _metadata: {
      }
    });

    sleepCounter.current = 0;
    dreamTime.current = 1
    possessed.current = false

    return [withDialog, surrealistDream]
  }
}

const spectate: MentalProcess = async ({ workingMemory: memory }) => {
  const { speak, log, dispatch  } = useActions()

const [, whilePossessed] = await internalMonologue(memory, 
  {
    instructions: "Wait, did I JUST SAY THAT?", 
    verb: "thought",
  }, { model: "exp/llama-v3-70b-instruct" })

log("Intuition:", whilePossessed)

dispatch({
  action: "murmurs",
  content: whilePossessed,
  _metadata: {
  }
});

return memory

}

export default { possession, spectate }
