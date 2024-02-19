import { ChatMessageRoleEnum, CortexStep, z } from "socialagi";

export const identifyMessageTarget = (userName: string) => {
  return ({ entityName }: CortexStep<any>) => {
    const params = z.object({
      targetUser: z
        .string()
        .describe(`The user id or user name of ${userName}'s interlocutor or "unknown" if it could not be identified.`),
    });

    return {
      name: "save_message_target",
      description: `Save the user info of the ${userName}'s message target.`,
      command: `Model the mind of ${entityName} (Discord user ID ${soul.env.botUserId}). The last message was sent by ${userName}. Identify who the message was sent to. ATTENTION: it was SOMEONE ELSE than ${userName}.`,
      parameters: params,
      process: (step: CortexStep<any>, response: z.output<typeof params>) => {
        return {
          value: response.targetUser,
          memories: [
            {
              role: ChatMessageRoleEnum.Assistant,
              content: `${step.entityName} identified the target of the last message: ${response.targetUser} `,
            },
          ],
        };
      },
    };
  };
};
