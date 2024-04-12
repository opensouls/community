import { MentalProcess, useActions, useSoulMemory } from "@opensouls/engine";
import externalDialog from "./lib/externalDialog.js";
import { formatResponse } from "./lib/formatResponse.js";
import internalMonologue from "./lib/internalMonologue.js";
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

  const prompt =
    mood.current === "cranky"
      ? "Cranky sarcastically replies with 1, 2, or 3 words. Nothing more."
      : "Cranky is not as cranky as usual, and replies with 3 to 5 words.";

  [memory, response] = await externalDialog(memory, prompt, {
    model: "quality",
  });
  response = response.replace(/[^a-zA-Z0-9 ]/g, "").toUpperCase();

  let format;
  [memory, format] = await formatResponse(memory, mood.current, undefined);
  log("format:", format);

  dispatch({
    action: "says",
    content: response,
    _metadata: {
      format,
      mood: mood.current,
    },
  });

  return memory;
};

export default initialProcess;
