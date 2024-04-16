import { createCognitiveStep, WorkingMemory, ChatMessageRoleEnum, indentNicely, stripEntityAndVerb, stripEntityAndVerbFromStream } from "@opensouls/engine";

const emojiEmotion = createCognitiveStep((instructions: string | { instructions: string; verb: string }) => {
  let instructionString: string, verb: string;
  if (typeof instructions === "string") {
    instructionString = instructions;
    verb = "feels";
  } else {
    instructionString = instructions.instructions;
    verb = instructions.verb;
  }

  return {
    command: ({ soulName: name }: WorkingMemory) => {
      return {
        role: ChatMessageRoleEnum.System,
        name: name,
        content: indentNicely`
          Model the mind of ${name}.

          ## Description
          ${instructionString}

          ## Rules
          * Emojis returned should match the personality of ${name}.
          * Pick one or two face emojis that show how ${name} is feeling.

          Please reply with the emojis in the format: '${name} ${verb}: "😍"'
        `
      };
    },
    streamProcessor: stripEntityAndVerbFromStream,
    postProcess: async (memory: WorkingMemory, response: string) => {
      const stripped = stripEntityAndVerb(memory.soulName, verb, response);
      const newMemory = {
        role: ChatMessageRoleEnum.Assistant,
        content: `${memory.soulName} ${verb}: "${stripped}"`
      };
      return [newMemory, stripped];
    }
  }
})

export default emojiEmotion
