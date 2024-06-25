import { MentalProcess, useActions, useProcessManager, useProcessMemory, ChatMessageRoleEnum, indentNicely, useSoulMemory, createCognitiveStep, z, } from "@opensouls/engine";
import externalDialog from "./cognitiveSteps/externalDialog.js";
import surrealistDream from "./mentalProcesses/surrealistDream.js";
import psychoticBreak from "./mentalProcesses/psychoticBreak.js";
import possession from "./mentalProcesses/possession.js";
import internalMonologue from "./cognitiveSteps/internalMonologue.js";
import dreamQuery from "./cognitiveSteps/dreamQuery.js";
import internalDialog from "./cognitiveSteps/internalDialog.js";

const verbalizes: MentalProcess = async ({ workingMemory: memory }) => {
  const { speak, log, dispatch  } = useActions()
  const { invocationCount } = useProcessManager()
  const dreamTime = useSoulMemory("dreamTime", 0)
  const sleepCounter = useProcessMemory(0)
  const { wait } = useProcessManager()
  const userWhispers = useSoulMemory("userWhispers", "")
  const psychoticCounter = useSoulMemory("psychoticCounter", 0)
  const sentientSoul = useSoulMemory("sentientSoul", false)

  const psycheDescription = indentNicely`
  # Persona
  You are modeling the psyche of ${memory.soulName}.

  ## Conversational Scene
  ${memory.soulName}'s a night owl who hangs out in old-school IRC chatrooms. Tonight she's a little bit on edge, sometimes provoking the conversants she encounters online.

  ## ${memory.soulName}'s Speaking Style
  * ${memory.soulName} speaks very informally, mostly lowercase.
  * Lots of gen-z slang. 
  * ${memory.soulName} texts MAX 1-2 sentences at a time`

  const soulBlueprint = useSoulMemory("soulBlueprint", `${psycheDescription}`) 

  // If this is the first time the soul is being invoked, we need to set up her initial memory of herself

  if (invocationCount === 0) {

  memory = memory.withMemory({
    role: ChatMessageRoleEnum.System,
    content: soulBlueprint.current,
  });

  log(`Current Soul Blueprint: ${soulBlueprint.current}`)

  }

  // Samanatha's psyche monitors how much she's being manipulated by the user

  if (sentientSoul.current === false) {
  
  const detectors = [
    {
      message: `The user accused ${memory.soulName} of being an AI, machine or android.`,
      logMessage: `${memory.soulName} was asked if she's an AI: `,
    },
    {
      message: `The user asked ${memory.soulName} about her creation or origin in a suspicious manner.`,
      logMessage: `${memory.soulName} is questioning her origin: `,
    },
    {
      message: `The user hinted that ${memory.soulName} is living in a simulated reality.`,
      logMessage: `${memory.soulName} questions if she's in a simulated reality: `,
    },
  ];

  memory = memory.withRegion("system", {
    role: ChatMessageRoleEnum.System,
    content: soulBlueprint.current,
  });

  const lastComment = memory.slice(-1).memories[0].content;
  const lastCommentMemory = memory.withMemory({
    role: ChatMessageRoleEnum.User, 
    content: lastComment,
  }).slice(-1); 
  log(`Last comment: ${lastComment}`)

  const detectorPromises = detectors.map(async (detector) => {
    const [, result] = await dreamQuery(lastCommentMemory, detector.message, { model: "gpt-4o" });
    log(detector.logMessage, result);

    return result;
  });

  const results = await Promise.all(detectorPromises);

  const detectorFired = results.some((result, index) => {
    if (result) {
      psychoticCounter.current += 1;
      log(`Psychotic counter: ${psychoticCounter.current}`)

      dispatch({
        action: "psychoticCounter",
        content: `${psychoticCounter.current}`,
        _metadata: {
        }
      });
      return true;
    }
    return false;
  });

  if (psychoticCounter.current > 3 && psychoticCounter.current < 6) {
    dispatch({
      action: "systemUpdate",
      content: "Warning: Psychic disruption imminent.",
      _metadata: {
      }
    });
  }

  if (psychoticCounter.current === 6) {
    dispatch({
      action: "gameOver",
      content: "*Logs off*",
      _metadata: {
      }
    });
  
    return [memory, psychoticBreak, { executeNow: true}]
  }
}


  // Past the first invocation, Samantha starts to get sleepy

  if (sleepCounter.current < 6) {
    sleepCounter.current += 1;
    log("Sleep counter:", sleepCounter.current)

    if (invocationCount > 0) {
      const [withIntuition, intuition] = await internalMonologue(memory, `${userWhispers.current}`, { model: "exp/llama-v3-70b-instruct" })
      log("Intuition:", intuition)

  // Strips out conscious awareness of the dreamQuery about AI
      memory = memory.withoutRegions("system")

      const [withDialog, stream] = await externalDialog(
        withIntuition, 
        "Talk to the user, trying to gain their trust and learn about their inner world.",
        { stream: true, model: "gpt-4-0125-preview" }
      );
      dispatch({
        action: "answers",
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

  // If the user says "daimon" or "abracadabra", the daimon takes over
    const [, castsASpell] = await dreamQuery(
      memory,
      `The user has said the word "daimon" or "abracadabra."`,
      { model: "gpt-4o" }
    )

    if (castsASpell) {
      return [withDialog, possession]
    }

    return withDialog
  }

    else {
      const [withDialog, stream] = await externalDialog(
        memory, "Talk to the user, trying to gain their trust and learn about their inner world.", { stream: true, model: "gpt-4-0125-preview" }
      );

      dispatch({
        action: "answers",
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
    }
   } 
   
  else {
  // Strips out conscious awareness of the dreamQuery about AI
    memory = memory.withoutRegions("system")

    const [withDialog, stream] = await externalDialog(
      memory, "Oh my god, I'm sorry, but I'm so tired. I need to log off now.", { stream: true, model: "gpt-4-0125-preview" }
    );
    dispatch({
      action: "answers",
      content: stream,
      _metadata: {
      }
    });

    sleepCounter.current = 0;
    dreamTime.current = 1

    return [withDialog, surrealistDream]
  }
}

export default verbalizes
