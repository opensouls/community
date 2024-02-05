
import { html } from "common-tags";
import { ChatMessageRoleEnum, CortexStep, internalMonologue, mentalQuery } from "socialagi";
import { MentalProcess, useActions, useProcessMemory, useSoulMemory } from "soul-engine";


const userNotes = (userName: string) => () => ({
  command: ({ entityName }: CortexStep) => {
    return html`      
      ## Description
      Write an updated and clear set of notes on ${userName} that ${entityName} would want to remember.

      ## Rules
      * Keep descriptions as bullet points
      * Keep relevant bullet points from before
      * Use abbreviated language to keep the notes short
      * Do not write any notes about ${entityName}

      Please reply with the updated notes on ${userName}:'
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

const modelsChatters: MentalProcess = async ({ step: initialStep }) => {
  const { log } = useActions()
  const lastProcessed = useProcessMemory("")

  let unprocessedMessages = initialStep.memories.filter((m) => m.role === ChatMessageRoleEnum.User)

  if (lastProcessed.current) {
    const idx = unprocessedMessages.findIndex((m) => (m.metadata?.discordMessage as any)?.id === lastProcessed.current)
    if (idx > 0) {
      unprocessedMessages = unprocessedMessages.slice(idx + 1)
    }
  }

  log("unprocessedMessages count", unprocessedMessages.length)

  for (const message of unprocessedMessages) {
    const discordMessage = message.metadata?.discordMessage as any
    const userName = discordMessage.username
    if (!userName) {
      continue
    }
    const userModel = useSoulMemory(userName, "")
    let step = initialStep

    const modelQuery = await step.compute(mentalQuery(`${step.entityName} has learned something new and they need to update the mental model of ${userName}.`));
    log("Update model?", userName, modelQuery)
    if (modelQuery) {
      step = await step.next(internalMonologue("What have I learned specifically about the user from the last few messages?", "noted"))
      log("Learnings:", step.value)
      userModel.current = await step.compute(userNotes(userName))
    }
  }

  lastProcessed.current = (unprocessedMessages.slice(-1)[0]?.metadata?.discordMessage as any).id || ""

  // no memories on the users for now
  return initialStep
}

export default modelsChatters
