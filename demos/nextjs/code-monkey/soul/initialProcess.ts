import { MentalProcess, WorkingMemory, indentNicely, useActions } from "@opensouls/engine";
import decision from "./lib/decision.js";
import externalDialog from "./lib/externalDialog.js";
import internalMonologue from "./lib/internalMonologue.js";
import mentalQuery from "./lib/mentalQuery.js";

const initialProcess: MentalProcess = async ({ workingMemory }) => {
  const { speak, log } = useActions();

  let memory = workingMemory;
  let stream;

  const [code, info, question, chat] = [
    "They explicitly asked CodeMonkey to write code",
    "They provided information that CodeMonkey requested to start coding",
    "They asked a new technical question",
    "They're continuing the conversation or just chit-chatting",
  ];
  const [, intent] = await decision(
    memory,
    {
      description: "What is the intent of the user with their latest message?",
      choices: [code, info, question, chat],
    },
    { model: "quality" }
  );

  log("Intent:", intent);

  if (intent === code || intent === info) {
    const [, canOutline] = await mentalQuery(
      memory,
      "CodeMonkey has enough information to write an outline of the code.",
      {
        model: "quality",
      }
    );

    if (canOutline) {
      return await withCodeOutline({ memory });
    } else {
      return await withMoreInformationRequest({ memory });
    }
  } else if (intent === question) {
    log("Thinking about the user's question");
    [memory] = await internalMonologue(memory, "Think step by step about the answer to the user's question.", {
      model: "quality",
    });
  }

  [memory, stream] = await externalDialog(memory, "CodeMonkey answers the user's message.", {
    stream: true,
    model: "quality",
  });

  speak(stream);
  await memory.finished;

  return memory;
};

const withCodeOutline = async ({ memory }: { memory: WorkingMemory }) => {
  const { speak, log } = useActions();

  let stream;

  log("Outlining coding approach");
  [memory, stream] = await externalDialog(
    memory,
    indentNicely`
      CodeMonkey does NOT WRITE CODE yet. He just:
      1. outlines his coding approach in a concise step-by-step list, using a few words for each step
      2. either:
        2.1. makes a list of all the information missing, if any
        2.2. OR if he has all the information he needs, says something like 'let's start coding!'
    `,
    {
      model: "quality",
      stream: true,
    }
  );

  speak(stream);
  await memory.finished;

  const [, isInformationMissing] = await mentalQuery(
    memory,
    "CodeMonkey needs more information before he can start coding.",
    {
      model: "quality",
    }
  );

  if (isInformationMissing) {
    return await withMoreInformationRequest({ memory });
  }

  return await withCodeWriting({ memory });
};

async function withMoreInformationRequest({ memory }: { memory: WorkingMemory }) {
  const { speak, log } = useActions();

  let stream;

  log("Asking for more information");
  [memory, stream] = await externalDialog(memory, "CodeMonkey asks the user for more information.", {
    model: "quality",
    stream: true,
  });
  speak(stream);

  return memory;
}

async function withCodeWriting({ memory }: { memory: WorkingMemory }) {
  const { speak, log } = useActions();

  let stream;

  log("Writing the code based on all the available information");
  [memory, stream] = await externalDialog(
    memory,
    "CodeMonkey writes the code based on all the available information, enclosing code in ```",
    {
      model: "quality",
      stream: true,
    }
  );

  speak(stream);
  await memory.finished;

  return memory;
}

export default initialProcess;
