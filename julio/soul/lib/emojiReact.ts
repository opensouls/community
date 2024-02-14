import { ChatMessageRoleEnum, CortexStep, z } from "socialagi";

export const emojiReaction = () => {
  return ({ entityName }: CortexStep<any>) => {
    const params = z.object({
      emoji: z
        .string()
        .describe(`What emoji should ${entityName} use to react to the last message.`),
    });

    return {
      name: "save_emoji_reaction",
      description: `Save the chosen RENDERED emoji (a single emoji character).`,
      command: `Model the mind of ${entityName}. ${entityName} chose an emoji to react to the last message.`,
      parameters: params,
      process: (step: CortexStep<any>, response: z.output<typeof params>) => {
        return {
          value: response.emoji,
          memories: [
            {
              role: ChatMessageRoleEnum.Assistant,
              content: `${step.entityName} chose: ${response.emoji} `,
            },
          ],
        };
      },
    };
  };
};
