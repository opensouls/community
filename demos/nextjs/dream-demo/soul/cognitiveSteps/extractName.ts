import { createCognitiveStep, indentNicely, z } from "@opensouls/engine";

const extractName = createCognitiveStep(() => {
    return {
      schema: z.object({
        name: z.string().describe("The name of the user")
      }),
      command: indentNicely`
        Extract the name of the user from the chat.
      `
    }
  })

  export default extractName;