import { WorkingMemory } from "@opensouls/core";
import { useActions } from "@opensouls/engine";
import externalDialog from "../lib/externalDialog.js";
import { formatResponse } from "../lib/formatResponse.js";
import { Mood } from "./types.js";

export async function replyToUser(workingMemory: WorkingMemory, prompt: string, mood: Mood) {
  const { dispatch, log } = useActions();

  let memory = workingMemory;

  let response;
  [memory, response] = await externalDialog(memory, prompt, {
    model: "quality",
  });

  const formatWithAscii = mood !== "less cranky";

  let format = {};
  if (formatWithAscii) {
    response = response.replace(/[^a-zA-Z0-9 ]/g, "").toUpperCase();

    [memory, format] = await formatResponse(memory, mood, undefined);
    log("format:", format);
  }

  dispatch({
    action: "says",
    content: response,
    _metadata: {
      format,
      mood,
    },
  });

  return memory;
}
