
import { MentalProcess, useActions, useProcessMemory, ChatMessageRoleEnum, WorkingMemory, createCognitiveStep, indentNicely } from "@opensouls/engine";
import mentalQuery from "../cognitiveSteps/mentalQuery.js";
import internalMonologue from "../cognitiveSteps/internalMonologue.js";

const userNotes = createCognitiveStep(() => {
  return {
    command: ({ soulName: name }: WorkingMemory) => {
      return {
        role: ChatMessageRoleEnum.System,
        content: indentNicely`
          Model the mind of ${name}.

          ## Description
          Write an updated and clear set of notes on the user that ${name} would want to remember.
        
          ## Rules
          * Keep descriptions as bullet points
          * Keep relevant bullet points from before
          * Use abbreviated language to keep the notes short
          * Do not write any notes about ${name}
        
          Please reply with the updated notes on the user:'
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

const learnsAboutTheUser: MentalProcess = async ({ workingMemory }) => {
  const userModel = useProcessMemory("Unkown User")
  const { log } = useActions()

  const mem = workingMemory.withMemory({
    role: ChatMessageRoleEnum.Assistant,
    content: indentNicely`
      ${workingMemory.soulName} remembers:

      # User model

      ${userModel.current}
    `
  })

  const [, shouldUpdateModel] = await mentalQuery(mem, `${mem.soulName} has learned something new and they need to update the mental model of the user.`);
  log("Update model?", shouldUpdateModel)
  if (shouldUpdateModel) {
    const [withLearnings,learnings] = await internalMonologue(mem, "What have I learned specifically about the user from the last few messages?", { model: "gpt-4-0125-preview" })
    log("Learnings:", learnings)
    const [, notes] = await userNotes(withLearnings, undefined, { model: "gpt-4-0125-preview"})
    log("Notes:", notes)
    userModel.current = notes
  }

  const [,shouldUpdateBehavior] = await mentalQuery(mem, `${mem.soulName} needs to make changes to their behavior.`);
  log("Internal voice?", shouldUpdateBehavior)
  if (shouldUpdateBehavior) {
    const [,thought] = await internalMonologue(
      mem, 
      {
        instructions: "What should I think to myself to change my behavior? Start with 'I need...'", 
        verb: "thinks",
      },
      { model: "gpt-4-0125-preview" }
    );
    return mem.withMemory({
      role: ChatMessageRoleEnum.Assistant,
      content: `${mem.soulName} thinks to themself: ${thought}`
    })
  }

  return mem
}

export default learnsAboutTheUser