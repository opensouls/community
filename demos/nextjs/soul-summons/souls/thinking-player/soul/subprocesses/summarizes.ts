import { ChatMessageRoleEnum, MentalProcess, indentNicely, useActions, useProcessMemory } from "@opensouls/engine";
import conversationNotes from "../lib/conversationNotes.js";
import internalMonologue from "../lib/internalMonologue.js";

const summarizesConversation: MentalProcess = async ({ workingMemory }) => {
  const conversationModel = useProcessMemory(
    `${workingMemory.soulName} is talking to one or more people and trying to learn as much as possible about them.`
  );
  const { log: engineLog } = useActions();
  const log = (...args: any[]) => {
    engineLog("[summarizes]", ...args);
  };

  if (workingMemory.memories.length <= 15) {
    return workingMemory;
  }

  let memory = workingMemory;

  log("Updating conversation notes");
  [memory] = await internalMonologue(memory, {
    instructions: "What have I learned in this conversation.",
    verb: "noted",
  });

  const [, updatedNotes] = await conversationNotes(memory, conversationModel.current);
  conversationModel.current = updatedNotes as string;

  return workingMemory
    .slice(0, 1)
    .withMemory({
      role: ChatMessageRoleEnum.Assistant,
      content: indentNicely`
      ## Conversation so far
      ${updatedNotes}
    `,
      metadata: {
        conversationSummary: true,
      },
    })
    .concat(workingMemory.slice(-8));
};

export default summarizesConversation;
