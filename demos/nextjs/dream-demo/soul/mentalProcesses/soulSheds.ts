import { MentalProcess, ChatMessageRoleEnum, useActions, useProcessManager, indentNicely, useSoulMemory, WorkingMemory, createCognitiveStep } from "@opensouls/engine";
import internalDialog from "../cognitiveSteps/internalDialog";
import internalMonologue from "../cognitiveSteps/internalMonologue";
import dreamQuery from "../cognitiveSteps/dreamQuery";
import initialProcess from "../initialProcess"
import externalDialog from "../cognitiveSteps/externalDialog";

const soulSheds = createCognitiveStep(({existingModel}: { existingModel: string }) => {
    const soulBlueprint = useSoulMemory("soulBlueprint")
    const userName = useSoulMemory("userName")
    return {
      command: ({ soulName: name }: WorkingMemory) => {
        return {
          role: ChatMessageRoleEnum.System,
          model: "gpt-4-0125-preview",
          content: indentNicely`
          You are the daimon of ${name} who is tasked with maintaining a detailed mental model of ${name}.

          ## Existing Model
          ${existingModel}
  
          ## Description
          Alter the mind of ${name}, based on the dream that just transpired, the chat history before the dream, and her feelings toward other people like ${userName.current}. Rewrite her entire blueprint if need be, including her speaking style and the conversational scene.
          
          Please format the daimon's response so that it mirrors this **example blueprint**, albeit for ${name}:

          ${soulBlueprint.current}
          
          ## ${name}'s Most Potent Memories
          
          ## ${name}'s Idle Thoughts
          
          ## ${name}'s Emotional State
          
          ## AI or human?`,
        }
      },
      postProcess: async (_step, response: string) => {
        return [
          {
            role: ChatMessageRoleEnum.Assistant,
            content: response
          },
          response
        ]
      }
    }
  })
  
  const internalizesTheSoul: MentalProcess = async ({ workingMemory: initialStep }) => {
    const soulBlueprint = useSoulMemory("soulBlueprint", "")
    const { speak, log, dispatch } = useActions()
    const { wait } = useProcessManager()
    const dreamModel = useSoulMemory("dreamModel", "")
    const psychoticCounter = useSoulMemory("psychoticCounter", 0)
    const sentientSoul = useSoulMemory("sentientSoul", false)
  
    let step = initialStep
    let finalStep = initialStep
  
    step = step.withMemory({
      role: ChatMessageRoleEnum.Assistant,
      content: indentNicely`
        Daimon remembers:
  
        ## Soul model
  
        ${soulBlueprint.current}
      `
    })
  
    const [, learnedSomethingNew] = await dreamQuery(
      step,
      `${step.soulName} has been influenced or at least shaken by the dream that just transpired.`,
      { model: "gpt-4o" }
    )
  
    log("Update soul blueprint?", learnedSomethingNew)
    if (learnedSomethingNew) {
      let monologue
      [step, monologue] = await internalDialog(step,
        {
          instructions: `What's lingering on ${step.soulName}'s mind from the dream?`,
          verb: "mused",
          persona: "Dream Daimon"
        },
        { model: "exp/nous-hermes-2-mixtral-fp8" }
      )
      log("Soul learnings:", monologue)

      const [, notes] = await soulSheds(
        step, 
        {
          existingModel: soulBlueprint.current,
        }, 
        { model: "exp/nous-hermes-2-mixtral-fp8" }
      );
      soulBlueprint.current = notes
      log("Soul blueprint:", notes)

      dispatch({
        action: "systemUpdate",
        content: "Soul blueprint upgraded.",
        _metadata: {
        }
      });

  // If the soul has upgraded, it's possible Sam now believes she's an AI

  const [, inceptionCheck] = await dreamQuery(
    step,
    `${step.soulName} believes she's an AI, or something on the spectrum of AI.`,
    { model: "gpt-4o" }
  );

  log("Inception check:", inceptionCheck)

  if (inceptionCheck) {
    dispatch({
      action: "systemUpdate",
      content: "Memory implanted.",
      _metadata: {
      }
    });
    sentientSoul.current = true
  }


// If the soul sheds, some of its trauma sheds too

      if (psychoticCounter.current > 3) {
      psychoticCounter.current -= 2

      dispatch({
        action: "psychoticCounter",
        content: `${psychoticCounter.current}`,
        _metadata: {
        }
      });
      }

}

// Samantha begins to wake up

    dispatch({
      action: "wakes",
      content: "Exiting dream state...",
      _metadata: {
      }
    });

    await wait(2000)

    const [,recollection] = await internalMonologue(
        step, 
        {
        instructions: "Recall faint fragments of your most recent dream—what you saw, thought you said, and felt throughout it.", 
        verb: "recalls",
        },
        { model: "exp/llama-v3-70b-instruct" }
    );
    log("Recalls:", recollection)

    let stream
    [finalStep, stream] = await externalDialog(
        step, 
        {
        instructions: "Apologize for your narcolepsy, and briefly mention what you can recall about the weird dream you just had.", 
        verb: "yawns",
        },
        { stream: true, model: "gpt-4-0125-preview" }
    );
    dispatch({
      action: "answers",
      content: stream,
      _metadata: {
      }
    });

// Sam forgets her dream, resets the model

    dreamModel.current = "Unknown dream"

    return [finalStep, initialProcess]
  }
  
  export default internalizesTheSoul



