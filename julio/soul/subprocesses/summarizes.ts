import { ChatMessageRoleEnum, CortexStep, internalMonologue } from "socialagi";
import { MentalProcess, useActions, useProcessMemory } from "soul-engine";
import { prompt } from "../lib/prompt.js";

const conversationNotes = (existing: string) => () => ({
  command: ({ entityName: name }: CortexStep) => {
    return prompt`
      ## Existing notes
      ${existing}

      ## Description
      Write an updated and clear paragraph describing the conversation so far.
      Make sure to keep details that ${name} would want to remember.

      ## Rules
      * Keep descriptions as a paragraph
      * Keep relevant information from before
      * Use abbreviated language to keep the notes short
      * Make sure to detail the motivation of ${name} (what are they trying to accomplish, what have they done so far).

      Please reply with the updated notes on the conversation:'
  `;
  },
});

const summarizesConversation: MentalProcess = async ({ step: initialStep }) => {
  const conversationModel = useProcessMemory(prompt`
    ${initialStep.entityName} is talking to one or more people and trying to learn as much as possible about them.
  `);
  const { log: engineLog } = useActions();
  const log = (...args: any[]) => {
    engineLog("[summarizes]", ...args);
  };

  let step = initialStep;
  let finalStep = initialStep;

  if (step.memories.length > 15) {
    log("Updating conversation notes");
    step = await step.next(internalMonologue("What have I learned in this conversation.", "noted"));

    const updatedNotes = await step.compute(conversationNotes(conversationModel.current));
    conversationModel.current = updatedNotes as string;

    return finalStep.withUpdatedMemory(async (memories) => {
      const newMemories = memories.flat();
      return [
        newMemories[0],
        {
          role: ChatMessageRoleEnum.Assistant,
          content: prompt`
            ## Conversation so far
            ${updatedNotes}
          `,
          metadata: {
            conversationSummary: true,
          },
        },
        ...newMemories.slice(-8),
      ];
    });
  }

  return finalStep;
};

export default summarizesConversation;
