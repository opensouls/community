
import { html } from "common-tags";
import { ChatMessageRoleEnum, CortexStep, internalMonologue } from "socialagi";
import { MentalProcess, useActions, useProcessMemory } from "soul-engine";

const conversationNotes = (existing: string) => () => ({
  command: ({ entityName: name }: CortexStep) => {
    return html`
      ## Existing notes
      ${existing}

      ## Description
      Write an updated and clear paragraph describing the conversation so far.
      Make sure to keep details that ${name} would want to remember.

      ## Rules
      * Keep descriptions as a paragraph
      * Keep relevant information from before
      * Use abbreviated language to keep the notes short
      * Make sure to detail the motivation of ${name} (what are they trying to accomplish, what have they done so far).

      Please reply with the updated notes on the conversation:'
  `}
})

const summarizesConversation: MentalProcess = async ({ step: initialStep }) => {
  const conversationModel = useProcessMemory(html`
    Sinky met a new user for the first time. They are just getting to know each other and Sinky is trying to learn as much as they can about the user.
  `)
  const { log } = useActions()

  let step = initialStep
  let finalStep = initialStep

  if (step.memories.length > 9) {
    log("updating conversation notes")
    step = await step.next(
      internalMonologue("What have I learned in this conversation.", "noted")
    )

    const updatedNotes = await step.compute(conversationNotes(conversationModel.current))
    conversationModel.current = updatedNotes as string

    return finalStep.withUpdatedMemory(async (memories) => {
      const newMemories = memories.flat()
      return [
        newMemories[0],
        newMemories[1],
        {
          role: ChatMessageRoleEnum.Assistant,
          content: html`
            ## Conversation so far
            ${updatedNotes}
          `,
          metadata: {
            conversationSummary: true
          }
        },
        ...newMemories.slice(-4)
      ]
    })
  }

  return finalStep
}

export default summarizesConversation
