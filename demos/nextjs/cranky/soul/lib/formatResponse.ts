import { ChatMessageRoleEnum, createCognitiveStep, z } from "@opensouls/engine";

export const formatResponse = createCognitiveStep(() => {
  const params = z.object({
    reason: z.string().describe(`The reason for the chosen format in under 10 words.`),
    font: z.string().describe(`The ASCII font to use.`),
    color: z.array(z.string()).describe(`The color to apply to the font.`),
  });

  return {
    schema: params,
    command: ({ soulName: name }: { soulName: string }) => {
      return {
        role: ChatMessageRoleEnum.System,
        name: name,
        content: `
          Model the mind of ${name}. 

          You need to format ${name}'s response in a way that matches what they're feeling and saying.
          
          ## Fonts
          You can choose any of these fonts:

          ### Small fonts
          - 'Small'

          ### Medium fonts
          - 'ANSI Shadow'
          - 'Bloody'
          - 'Dancing Font' (letters are dancing)
          - 'THIS' (horror font)
          - 'Invita' (cursive)
          - 'Larry 3D' (3d)

          ### Big fonts
          - 'Electronic'
          - 'Delta Corps Priest 1' (sci-fi feel)

          ## Colors

          Possible colors:
          - 'red'
          - 'green'
          - 'yellow'
          - 'blue'
          - 'magenta'
          - 'cyan'
          - 'white'
          - 'gray'
          - 'bright-black'
          - 'bright-red'
          - 'bright-green'
          - 'bright-yellow'
          - 'bright-blue'
          - 'bright-magenta'
          - 'bright-cyan'
          - 'bright-white'

          Reply with the font and colors you want to use.
        `,
      };
    },
    postProcess: async (memory: { soulName: string }, response: z.infer<typeof params>) => {
      const newMemory = {
        role: ChatMessageRoleEnum.Assistant,
        content: `${memory.soulName} chose: ${JSON.stringify(response)}`,
      };
      return [newMemory, response];
    },
  };
});
