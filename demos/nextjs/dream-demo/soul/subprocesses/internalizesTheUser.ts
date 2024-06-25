import { ChatMessageRoleEnum, MentalProcess, WorkingMemory, createCognitiveStep, indentNicely, useActions, useProcessMemory, useSoulMemory } from "@opensouls/engine";
import mentalQuery from "../cognitiveSteps/mentalQuery.js";
import internalMonologue from "../cognitiveSteps/internalMonologue.js";
import extractName from "../cognitiveSteps/extractName.js";

const userNotes = createCognitiveStep(({existingModel}: { existingModel?: string }) => {
  const soulBlueprint = useSoulMemory("soulBlueprint")
  const userName = useSoulMemory("userName")
  return {
    command: ({ soulName: name }: WorkingMemory) => {
      return {
        role: ChatMessageRoleEnum.System,
        model: "gpt-4-0125-preview",
        content: indentNicely`
        You are the daimon of ${name} who is tasked with maintaining a detailed mental model of ${userName.current}.

        ## Existing Model 
        ${existingModel || "No existing model of the user yet"}

        ## Description
        Model the mind of ${userName.current}, based on the provided chat history, and what you infer about their personality, diction, beliefs, and background.
        
        Please format the daimon's response so that it mirrors this **example blueprint**, albeit for ${userName.current}:

        ${soulBlueprint.current}
        `,
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

const internalizesTheUser: MentalProcess = async ({ workingMemory: initialStep }) => {
  const userModel = useSoulMemory("userModel", "")
  const { log } = useActions()
  const dreamTime = useSoulMemory("dreamTime", 0)
  const userName = useSoulMemory("userName", "")

  let step = initialStep
  let finalStep = initialStep

  if (dreamTime.current === 0) {
    step = step.withMemory({
      role: ChatMessageRoleEnum.Assistant,
      content: indentNicely`
        ${step.soulName} remembers:

        ## User model

        ${userModel.current}
      `
    })

    // If the user's name hasn't been learned, we need to set it for the perceptionProcessor

    if (!userName.current || userName.current === "Anon") {
      const [, didLearnName] = await mentalQuery(step, `${step.soulName} has learned or relearned the user's name.`, { model: "gpt-4-0125-preview" })
      if (didLearnName) {
        const [, extracted] = await extractName(step, undefined)
        log("Extracted name", extracted)
        userName.current = extracted.name
      }
    }

    //

    const [, learnedSomethingNew] = await mentalQuery(
      step,
      `${step.soulName} has learned something new about the user and they need to update their mental model of ${userName.current}.`,
      { model: "gpt-4-0125-preview" }
    )

    log("Update daimon?", learnedSomethingNew)
    if (learnedSomethingNew) {
      let monologue
      [step, monologue] = await internalMonologue(step,
        {
          instructions: `What have I learned specifically about ${userName.current} from the last few messages?`,
          verb: "mused"
        },
        { model: "gpt-4-0125-preview" }
      )
      log("User Learnings:", monologue)


      const [, notes] = await userNotes(
        step, 
        {
          existingModel: userModel.current
        }, 
        { model: "gpt-4-0125-preview" }
      );
      userModel.current = notes
      log(`${userName.current}'s Daimon:`, userModel.current)
    }
  }

  return finalStep
}

export default internalizesTheUser
