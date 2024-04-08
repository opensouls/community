import { createCognitiveStep, WorkingMemory, ChatMessageRoleEnum, indentNicely, z, stripEntityAndVerb, stripEntityAndVerbFromStream } from "@opensouls/engine";

const criteria = createCognitiveStep(({ description, criteria }: { description: string, criteria: string[] }) => {

    const params = z.object({
        criteriaMet: z.boolean().describe(`Have all the critera been met?`),
        missingCriteria: z.string().describe(`What criteria have been missed?`),
    });

    return {
        schema: params,
        command: ({ soulName: name }: WorkingMemory) => {
            return {
                role: ChatMessageRoleEnum.System,
                name: name,
                content: indentNicely`

          Evaluate the scene and decide if all the following criteria have been met from ${name} perspective:
          ${Array.isArray(criteria) ? criteria.map((c) => `* ${c}`).join('\n') : JSON.stringify(criteria, null, 2)}

          ## Description
          ${description}

          ## Rules
          *  Please choose true if all the criteria have been met for ${name}, or false if they have not.
          *  If false, explain what criteria were missing from ${name}'s perspective.
        `
            };
        },
        postProcess: async (memory: WorkingMemory, response: z.output<typeof params>) => {
            const newMemory = {
                role: ChatMessageRoleEnum.Assistant,
                content: `${memory.soulName} evaluated: \`${description}\` and decided that the criteria ${response.criteriaMet ? 'have' : 'have not'} been met.`
            };
            return [newMemory, response];
        }
    };
});

// const mentalQuery = createCognitiveStep((statement: string) => {

//     const params = z.object({
//         isStatementTrue: z.boolean().describe(`Is the statement true or false?`),
//     });

//     return {
//         command: ({ soulName: name }: WorkingMemory) => {
//             return {
//                 role: ChatMessageRoleEnum.System,
//                 name: name,
//                 content: indentNicely`
//           Model the mind of ${name} and decide if ${name} would believe the following statement is true or false:

//           > ${statement}

//           Please choose true if ${name} believes the statement is true, or false if ${name} believes the statement is false.
//         `,
//             };
//         },
//         schema: params,
//         postProcess: async (memory: WorkingMemory, response: z.output<typeof params>) => {
//             const newMemory = {
//                 role: ChatMessageRoleEnum.Assistant,
//                 content: `${memory.soulName} evaluated: \`${statement}\` and decided that the statement is ${response.isStatementTrue ? 'true' : 'false'}`
//             };
//             return [newMemory, response.isStatementTrue];
//         }
//     };
// });

export default criteria

