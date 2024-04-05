import { ChatMessageRoleEnum, InputMemory, PerceptionProcessor, useActions, usePerceptions } from "@opensouls/engine"

const perceptionProcessor: PerceptionProcessor = async ({ perception, workingMemory, currentProcess }) => {
  const { pendingPerceptions } = usePerceptions()
  const { log } = useActions()

  if (pendingPerceptions.current.length > 0) {
    // simply ignore this then
    log("ignoring due to pending")
    return undefined
  }

  const content = `Reggie's body changes to: ${perception.content}`

  const memory: InputMemory = {
    role: perception.internal ? ChatMessageRoleEnum.Assistant : ChatMessageRoleEnum.User,
    content,
    name: "Reggie",
    metadata: {
      ...perception._metadata,
      timestamp: perception._timestamp
    }
  }

  workingMemory = workingMemory.withMemory(memory)

  return [workingMemory, currentProcess]
}

export default perceptionProcessor