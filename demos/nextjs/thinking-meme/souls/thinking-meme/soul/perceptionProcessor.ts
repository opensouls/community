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

  
//TODO think about conversation flow

//----------------------
//(1) chatting to person (sending a few messages, each one shouldn't necessarily be responded to)
//add to working memory
//await wait(1000)  //wait a bit before responding
// if(pending) return [workingMemory, null] //ok lets leave they're still talking

//----------------------
//(2) ok time to respond to them? 
//  return [workingMemory, currentProcess]

//----------------------
//(3) what if we want to handle process/conversation routing here? (ie. old school game dialog trees)
// maybe go up or down a process tree 
//(are they trying to continue the chain of thought or go onto something else?

//---------------------- 
//(4) [[bigger design ideas]] like what if the LLM could write its on processes here?


//meanwhile in the background other processes might be running
//before we run a step do we ask the processor if its still ok?
//we might want to interrupt it before or after the step runs?

  return [workingMemory, currentProcess]
}

export default perceptionProcessor

