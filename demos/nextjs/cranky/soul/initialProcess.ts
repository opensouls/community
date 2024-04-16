import { MentalProcess, indentNicely, useActions, useSoulMemory } from "@opensouls/engine";
import internalMonologue from "./lib/internalMonologue.js";
import { replyToUser } from "./utils/reply-to-user.js";
import { Mood } from "./utils/types.js";

const initialProcess: MentalProcess = async ({ workingMemory }) => {
  const { dispatch, log } = useActions();
  const mood = useSoulMemory<Mood>("mood", "cranky");

  let memory = workingMemory;
  let response;

  [memory, response] = await internalMonologue(
    memory,
    "Cranky thinks about how they feel about the interlocutor's message, under 10 words."
  );
  log("feeling:", response);

  const prompt = promptByMood(mood.current);
  memory = await replyToUser(memory, prompt, mood.current);

  return memory;
};

const promptByMood = (mood: Mood): string => {
  if (mood === "less cranky") {
    return indentNicely`
      Cranky is not as cranky as usual and can reply freely, maximum 15 words. Can curse and still be sarcastic, though.

      No restrictions on characters, reply freely. Don't use all caps.
    `;
  }

  if (mood === "cranky again") {
    return indentNicely`
      Cranky is upset with the interlocutor and makes that apparent by sarcastically replying with 1, 2, or 3 words. Nothing more.
      
      Possible characters: [A-Z0-9\s] (no periods, commas, or other punctuation).
    `;
  }

  return indentNicely`
    Cranky is irritable for being trapped and sarcastically replies with 1, 2, or 3 words. Nothing more.
    
    Possible characters: [A-Z0-9\s] (no periods, commas, or other punctuation).
  `;
};

export default initialProcess;
