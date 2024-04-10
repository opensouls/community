import { MentalProcess, useActions } from "@opensouls/engine";
import externalDialog from "./lib/externalDialog.js";
import { formatResponse } from "./lib/formatResponse.js";
import internalMonologue from "./lib/internalMonologue.js";

const initialProcess: MentalProcess = async ({ workingMemory }) => {
  const { dispatch, log } = useActions();

  let memory = workingMemory;
  let response;

  [memory, response] = await internalMonologue(
    memory,
    "Cranky thinks about how they feel about the interlocutor's message, under 10 words."
  );
  log("feeling:", response);

  [memory, response] = await externalDialog(memory, "Cranky sarcastically replies with 3 or fewer words.", {
    model: "quality",
  });

  let format;
  [memory, format] = await formatResponse(memory, undefined);
  log("format:", format);

  dispatch({
    action: "says",
    content: response,
    _metadata: {
      format,
    },
  });

  return memory;
};

export default initialProcess;
