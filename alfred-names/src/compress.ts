import { html } from "common-tags";
import { ChatMessageRoleEnum, CortexStep } from "socialagi";
import { MentalProcess, useProcessMemory } from "soul-engine";

const compressFn = () => () => ({
  command: ({ entityName: name }: CortexStep) => {
    return html`
      ## Description
      Write an updated and compressed conversation history between the user and ${name} including content of the old history and the new messages.

      ## Instructions
      * Output the NEW Conversation History = Compress( OLD Conversation History + NEW Conversation Messages )
      * New conversation history is compressed version of the conversation messages to contain the salient details in narrative form
      * Focus primarily on the dialog between the soul and the user
      * If the summary becomes longer than 3 paragraphs, start cutting unimportant details, especially about the internal monologue of ${name}
      
      ## Example output. "The user and ${name} greeted each other. They talked about naming a company"

      Please reply with the NEW Conversation History in paragraph narrative form:'
  `},
  process: (_step: CortexStep<any>, response: string) => {
    return {
      value: response,
      memories: [{
        role: ChatMessageRoleEnum.Assistant,
        content: response
      }],
    }
  }
})

/*
Create a compressed and updated narrative of the conversation history between the user and the soul
*/
const compress: MentalProcess = async ({ step: initialStep }) => {
  const summary = useProcessMemory("None")
  let step = initialStep
  const memories = step.memories
  const length = memories.length
  const cutoff = 10
  if (length > cutoff + 1) {
    const start = memories[0]
    const toCompress = memories.slice(1, length-cutoff)
    const toKeep = memories.slice(length-cutoff)
    const compressInstructions = html`
      # OLD Conversation History

      ${summary.current}

      # NEW Conversation Messages

      ${toCompress.map(m => m.content).join("\n")}
    `
    let compressStep = await step.withUpdatedMemory(() => [{
      role: ChatMessageRoleEnum.System,
      content: compressInstructions
    }])
    const newHistory = await compressStep.next(compressFn(), { model: "quality" })
    summary.current = newHistory.value
    const newMemory = [
      start,
      {
        role: ChatMessageRoleEnum.Assistant,
        content: html`
          ${step.entityName} remembers from the past:

          ${summary.current}
        `
      },
      ...toKeep
    ]
    step = await step.withUpdatedMemory(() => newMemory)
  }
  return step
}

export default compress