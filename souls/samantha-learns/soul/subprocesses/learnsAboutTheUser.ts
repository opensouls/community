
import { MentalProcess, useActions, useProcessMemory, ChatMessageRoleEnum, WorkingMemory, createCognitiveStep, indentNicely } from "@opensouls/engine";
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

/* This subprocess models the idea that a subconscious portion of our brain would be tracking 
how we are thinking about a person and then surfacing thoughts into our conscious experience guiding what we say next
but the model of the person and the conversation is not explicitly in memory */
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

  // generate feedback to the soul for how its behavior should change
  const [,thought] = await internalMonologue(
    mem, 
    {
      instructions: "Reflect on the recent learnings about the user and my behavior", 
      verb: "thinks",
    },
    { model: "quality" }
  );
  log("Thought:", thought)

  // add the feedback to the initial working memory
  return workingMemory.withMonologue(`${mem.soulName} thinks to themself: ${thought}`)
}

export default learnsAboutTheUser