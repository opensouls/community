import { ChatMessageRoleEnum, InputMemory, Memory, PerceptionProcessor, useActions, useSoulMemory } from "@opensouls/engine"
 
function safeName(name?: string) {
  return (name || "").replace(/[^a-zA-Z0-9_-{}]/g, '_').slice(0, 62);
}
 
const perceptionProcessor: PerceptionProcessor = async ({ perception, workingMemory, currentProcess }) => {
  const { log } = useActions()
  const userName = useSoulMemory("userName", "Anon")
 
  const name = userName.current ? userName.current : perception.name
 
  const content = `${name} ${perception.action}: ${perception.content}`
 
  const memory: InputMemory = {
    role: perception.internal ? ChatMessageRoleEnum.Assistant : ChatMessageRoleEnum.User,
    content,
    ...(name ? { name: safeName(name) } : {}),
    metadata: {
      ...perception._metadata,
      timestamp: perception._timestamp
    }
  }

  log("Perception:", userName.current)
 
  workingMemory = workingMemory.withMemory(memory)
 
  return [workingMemory, currentProcess]
}
 
export default perceptionProcessor