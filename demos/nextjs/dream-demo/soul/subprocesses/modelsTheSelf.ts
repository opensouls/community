import { MentalProcess, useActions, useProcessMemory, useSoulMemory, ChatMessageRoleEnum, WorkingMemory, createCognitiveStep, indentNicely } from "@opensouls/engine";
import mentalQuery from "../cognitiveSteps/mentalQuery.js";
import internalMonologue from "../cognitiveSteps/internalMonologue.js";

const userNotes = createCognitiveStep(() => {
  const userName = useSoulMemory("userName", "")
    return {
      command: ({ soulName: name }: WorkingMemory) => {
        return {
          role: ChatMessageRoleEnum.System,
          content: indentNicely`
            Model the psyche of ${name} in its fullest empathetic capacity.

            ## Description
            Write an updated and clear set of notes on how ${name} is being perceived by ${userName.current}, based ONLY on information from the last few messages.
      
            ## Rules
            * Keep descriptions as bullet points
            * Sum up past bullets into one or two
            * Analyze ${name}'s perceived emotional state
            * Use abbreviated language to keep the notes short
            * DO NOT write notes about the user
            * Write in ${name}'s voice and tone
      
            Please reply with ${name}'s updated notes on how she's being perceived by the user.
            `
        }
      },
      postProcess: async (_mem: WorkingMemory, response: string) => {
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
  
  const learnsAboutTheSelf: MentalProcess = async ({ workingMemory: initialStep }) => {
      const { log } = useActions()
      const selfModel = useSoulMemory("selfModel", "Sense of self")
      const dreamTime = useSoulMemory("dreamTime", 0)
      const userName = useSoulMemory("userName", "")

      let step = initialStep
      let finalStep = initialStep
      
    if (dreamTime.current === 0) {
      step = step.withMemory({
        role: ChatMessageRoleEnum.Assistant,
        content: indentNicely`
          ${step.soulName} remembers:
    
          # Self model
    
          ${selfModel.current}
        `
      })
    
      const [, shouldUpdateModel] = await mentalQuery(
        step, 
        `The user has observed something new about ${step.soulName} and they're likely updating their own mental model of ${step.soulName}.`,
        { model: "gpt-4-0125-preview" }
      );  

      log("Update self model?", shouldUpdateModel)
      if (shouldUpdateModel) {
        const [withLearnings, learnings] = await internalMonologue(step, `What has ${userName.current} observed or learned specifically about ${step.soulName} from the last few messages?`, { model: "quality" })
        log("Learnings:", learnings)
        const [, notes] = await userNotes(withLearnings, undefined, { model: "quality"})
        log("Notes:", notes)
        selfModel.current = notes
      }
    }
    return finalStep
  }
  
  export default learnsAboutTheSelf

