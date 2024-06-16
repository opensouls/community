import { createCognitiveStep, WorkingMemory, ChatMessageRoleEnum, indentNicely, z } from "@opensouls/engine";

const dreamQuery = createCognitiveStep((statement: string) => {
  const params = z.object({
    isStatementTrue: z.boolean().describe(`Is the statement true or false?`),
  });

  return {
    command: ({ soulName: name }: WorkingMemory) => {
      return {
        role: ChatMessageRoleEnum.System,
        name: name,
        content: indentNicely`
          You are the daimon who orchestrates ${name}'s dreams and you decide if the following statement is true or false:

          > ${statement}

          Dream Daimon, please decide if you believe the statement is true, or false if you believe the statement is false.
        `,
      };
    },
    schema: params,
    postProcess: async (memory: WorkingMemory, response: z.output<typeof params>) => {
      const newMemory = {
        role: ChatMessageRoleEnum.Assistant,
        content: `The Dream Daimon evaluated: \`${statement}\` and decided that the statement is ${response.isStatementTrue ? 'true' : 'false'}`
      };
      return [newMemory, response.isStatementTrue];
    }
  };
});

export default dreamQuery
