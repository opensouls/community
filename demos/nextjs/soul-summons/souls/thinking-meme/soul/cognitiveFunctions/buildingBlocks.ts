import { createCognitiveStep, WorkingMemory, ChatMessageRoleEnum, indentNicely, z, useActions } from "@opensouls/engine";
import internalMonologue from "../lib/internalMonologue.js";
import externalDialog from "../lib/externalDialog.js";
import { RequestOptions } from "https";
import { SoulEvent } from "@opensouls/engine";

export type BuildingBlock = {
    stream?: boolean,
    model?: string,
    metadata?: SoulEvent['_metadata'],
}

const talk = async (workingMemory: WorkingMemory, description: string, params?: BuildingBlock) => {

    const { dispatch, log } = useActions();
    const [memory, stream] = await externalDialog(workingMemory, description, { ...params, model: 'quality'});
    dispatch({
        name: workingMemory.soulName,
        action: "says",
        content: stream,
        _metadata: {
            state: 'says',
            ...params?.metadata
        }
    });

    return [memory, stream] as [WorkingMemory, string];
}

const think = async (workingMemory: WorkingMemory, description: string, params?: BuildingBlock) => {

    const { dispatch, log } = useActions();
    const [memory, stream] = await internalMonologue(workingMemory, description, { ...params, model: 'quality'});
    dispatch({
        name: workingMemory.soulName,
        action: "thinks",
        content: stream,
        _metadata: {
            state: 'thinks',
            ...params?.metadata
        }
    });

    return [memory, stream] as [WorkingMemory, string];
}


const state = (workingMemory: WorkingMemory, metadata: SoulEvent['_metadata']) => {
    const { dispatch, log } = useActions();

    dispatch({
        name: workingMemory.soulName,
        action: "metadata",
        content: JSON.stringify(metadata,null,2),
        _metadata: metadata
    });

}

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

export { talk, think, state, criteria }

