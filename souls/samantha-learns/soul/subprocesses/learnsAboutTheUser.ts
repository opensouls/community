
import { MentalProcess, useActions, useProcessMemory, ChatMessageRoleEnum, WorkingMemory, createCognitiveStep, indentNicely } from "@opensouls/engine";
import mentalQuery from "../lib/mentalQuery.js";
import internalMonologue from "../lib/internalMonologue.js";

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
  // create a hook that persists the model of the user
  const userModel = useProcessMemory("Unkown User")
  const { log } = useActions()

  // remember the model of the user
  const mem = workingMemory.withMonologue(
    indentNicely`
      ${workingMemory.soulName} remembers:

      # User model

      ${userModel.current}
    `
  )

  // reflect on the message from the user and what it says about them
  const [withLearnings, learnings] = await internalMonologue(mem, "What have I learned specifically about the user from the last message?", { model: "quality" })
  log("Learnings:", learnings)

  // use that reflection to help update the user model
  const [, notes] = await userNotes(withLearnings, undefined, { model: "quality"})
  log("Notes:", notes)
  userModel.current = notes

  // provide feedback to the soul for how its behavior should change
  const [,thought] = await internalMonologue(
    mem, 
    {
      instructions: "Reflect on the recent learnings about the user and my behavior", 
      verb: "thinks",
    },
    { model: "quality" }
  );
  return mem.withMonologue(`${mem.soulName} thinks to themself: ${thought}`)
}

export default learnsAboutTheUser