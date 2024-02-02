
import { html } from "common-tags";
import { ChatMessageRoleEnum, CortexStep, internalMonologue, mentalQuery, z } from "socialagi";
import { MentalProcess, useActions, useProcessMemory, useSoulStore } from "soul-engine";

export const memoryFormatter = () => {
  return () => {

    const params = z.object({
      key: z.string().describe("A short descriptive, unique key to store the memory in the vector database."),
      memory: z.string().describe("the content of the memory to store.")
    })

    return {
      name: "save_memory",
      description: html`
        Sinky thinks about the conversation, and extracts any memories they would like to keep about the user.
      `,
      parameters: params,
    };
  }
}

const makesMemories: MentalProcess = async ({ step: initialStep }) => {
  const { set } = useSoulStore()
  const { log } = useActions()

  let step = initialStep
  let finalStep = initialStep
  
  const modelQuery = await step.compute(mentalQuery(`${step.entityName} wants to remember something poignant about the conversation.`));
  if (modelQuery) {
    step = await step.next(
      internalMonologue("What is a poignant event in this conversation that I'd like to remember.", "noted"),
      { model: "quality" }
    )
    log("Poignant memory:", step.value)

    const extractedMemory = await step.compute(memoryFormatter())
    set(`memory.${extractedMemory.key}`, extractedMemory.memory)
  }

  return finalStep
}

export default makesMemories
