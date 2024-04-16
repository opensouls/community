import { ChatMessageRoleEnum, createCognitiveStep, indentNicely, z } from "@opensouls/engine";
import { Mood } from "../utils/types.js";

export const formatResponse = createCognitiveStep((mood: Mood) => {
  const fonts = [
    "ANSI Shadow",
    "Bloody",
    "Dancing Font",
    "THIS",
    "Larry 3D",
    "Small",
    "Contessa",
    "Rectangles",
  ];

  const params = z.object({
    reason: z.string().describe(`The reason for the chosen format in under 10 words.`),
    font: z.nativeEnum(fonts as unknown as z.EnumLike).describe(`The ASCII font to use.`),
    color: z.string().describe(`The color to apply to the font.`),
  });

  return {
    schema: params,
    command: ({ soulName: name }: { soulName: string }) => {
      return {
        role: ChatMessageRoleEnum.System,
        name: name,
        content: indentNicely`
          Model the mind of ${name}. 

          You need to format ${name}'s response in a way that matches what they're feeling and saying.
          
          ## Fonts
          You can choose any of these fonts:
        
          ### Medium fonts
          - 'ANSI Shadow'
          - 'Bloody'
          - 'Dancing Font' (letters are dancing)
          - 'THIS' (horror font)
          - 'Larry 3D' (3d)

          ### Small fonts
          - 'Small'
          - 'Contessa' (smallest)
          - 'Rectangles' (chubby)

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

          Reply with the font and colors you want to use. Try not repeating your choices too much.
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
