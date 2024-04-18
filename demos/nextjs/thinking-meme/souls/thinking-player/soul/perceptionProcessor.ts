import { ChatMessageRoleEnum, InputMemory, Memory, PerceptionProcessor, useActions, useSoulMemory } from "@opensouls/engine"

const perceptionProcessor: PerceptionProcessor = async ({ perception, workingMemory, currentProcess }) => {
  const { log } = useActions()
  const userName = useSoulMemory("userName", "")

  log("perception");
  
  const name = userName.current ? userName.current : perception.name
  const content = `${name} ${perception.action}: ${perception.content}`

  const memory: InputMemory = {
    role: perception.internal ? ChatMessageRoleEnum.Assistant : ChatMessageRoleEnum.User,
    content,
    ...(name ? { name: name } : {}),
    metadata: {
      ...perception._metadata,
      timestamp: perception._timestamp
    }
  }

  workingMemory = workingMemory.withMemory(memory)

  return [workingMemory, currentProcess]
}

export default perceptionProcessor