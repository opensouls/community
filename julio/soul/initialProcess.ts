import { CortexStep, decision, externalDialog, internalMonologue, mentalQuery } from "socialagi";
import {
  MentalProcess,
  useActions,
  usePerceptions,
  useProcessManager,
  useRag,
  useSoulMemory,
  useSoulStore,
} from "soul-engine";
import { DiscordAction, DiscordEventData } from "../discord/soulGateway.js";
import { emojiReaction } from "./lib/emojiReact.js";
import { prompt } from "./lib/prompt.js";
import questionsAndAnswers from "./lib/questionsAndAnswers.js";
import {
  newMemory as createNewMemory,
  getLastMemory,
  getMetadataFromPerception,
  getUserDataFromDiscordEvent,
  random,
} from "./lib/utils.js";
import { defaultEmotion } from "./subprocesses/emotionalSystem.js";

export type ActionConfig =
  | {
      type: "says";
      sendAs: "message" | "reply";
    }
  | {
      type: "reacts";
      sendAs: "emoji";
    };

const initialProcess: MentalProcess = async ({ step: initialStep }) => {
  const { log } = useActions();
  const { invokingPerception } = usePerceptions();

  log("Initial process started");

  if (shouldSkipPerception()) {
    return initialStep;
  }

  const action = (invokingPerception?.action ?? "chatted") as DiscordAction;
  const { userName, discordEvent } = getMetadataFromPerception(invokingPerception);

  let step = await initialize(initialStep, discordEvent);

  if (action === "joined" || invokingPerception?.content === "JOINED") {
    step = await thinkOfWelcomeMessage(step, userName);
  } else {
    step = await thinkOfReplyMessage(step, userName, discordEvent);
  }

  return await saySomething(step, discordEvent);
};

function shouldSkipPerception() {
  const { log } = useActions();
  const { invokingPerception, pendingPerceptions } = usePerceptions();

  log("Pending perceptions count:", pendingPerceptions.current.length);

  const maximumQueuedPerceptions = 10;
  const tooManyPendingPerceptions = pendingPerceptions.current.length > maximumQueuedPerceptions;
  if (tooManyPendingPerceptions) {
    log("Skipping perception due to too many pending perceptions");
    return true;
  }

  const { userName } = getMetadataFromPerception(invokingPerception);
  const isMessageBurstBySamePerson = pendingPerceptions.current.some((perception) => {
    return getMetadataFromPerception(perception)?.userName === userName;
  });
  if (isMessageBurstBySamePerson) {
    log(`Skipping perception from ${userName} due to message burst`);
    return true;
  }

  return false;
}

async function initialize(
  initialStep: CortexStep<any>,
  discordEvent: DiscordEventData | undefined
) {
  const { invocationCount } = useProcessManager();

  if (invocationCount === 0) {
    await initializeSoulStore();
  }

  return await rememberUser(initialStep, discordEvent);
}

async function initializeSoulStore() {
  const { log } = useActions();
  const { wait } = useProcessManager();
  const { set } = useSoulStore();

  log("Initializing soul store with questions and answers");

  for (const { question, answer } of questionsAndAnswers) {
    set(
      question,
      prompt`
        ## ${question}

        ${answer}
      `
    );
  }

  await wait(1000);

  log(`${questionsAndAnswers.length} question-answer pairs embedded in soul store`);
}

async function rememberUser(step: CortexStep<any>, discordEvent: DiscordEventData | undefined) {
  const { log } = useActions();

  const { userName, userDisplayName } = getUserDataFromDiscordEvent(discordEvent);

  log("Remembering user");
  const userModel = useSoulMemory(userName, `- Display name: "${userDisplayName}"`);
  step = userModel.current
    ? step.withMemory(
        createNewMemory(`Julio remembers this about ${userName}:\n${userModel.current}`)
      )
    : step;

  if (userModel.current) {
    log(`Julio remembers this about ${userName}:\n${userModel.current}`);
  } else {
    log(`Julio has no memories involving ${userName} `);
  }

  return step;
}

async function thinkOfWelcomeMessage(step: CortexStep<any>, userName: string) {
  const { log } = useActions();

  log("New member joined the server");
  const thought = await step.compute(
    internalMonologue(`Julio thinks of a short and cool welcome message for ${userName}.`)
  );

  step = step.withMemory(
    createNewMemory(
      prompt(`
        Julio thought: "${thought} oh and I CANNOT FORGET to mention these SUPER IMPORTANT things:
        - there are 3 levels in the server: welcome area, satoshi street, and collector's corner
        - ${userName} needs to know that the name of the place we are now is "the welcome area" (level 1)
        - ${userName} should check out level 2: satoshi street
        - if ${userName} is a holder, they should go to #🔳-holder-verify so they can join level 3: the collector's corner"
      `)
    )
  );

  return step;
}

async function thinkOfReplyMessage(
  step: CortexStep<any>,
  userName: string,
  discordEvent: DiscordEventData | undefined
) {
  const { log, dispatch } = useActions();

  log("Computing emoji");
  const emoji = await step.compute(emojiReaction());

  const actionConfig: ActionConfig = {
    type: "reacts",
    sendAs: "emoji",
  };

  dispatch({
    action: "reacts",
    content: emoji,
    _metadata: {
      discordEvent,
      actionConfig,
    },
  });

  const ragTopics =
    "Julio, Super Julio World, the Super Julio World Discord Server, or Bitcoin Ordinals";
  const needsRagContext = await step.compute(
    decision(`${userName} has asked a question about ${ragTopics}`, ["true", "false"]),
    { model: "quality" }
  );

  if (needsRagContext === "true") {
    step = await thinkOfReplyWithRag(step, userName);
  } else {
    step = await thinkOfReplyWithoutRag(step, userName);
  }

  return step;
}

async function thinkOfReplyWithRag(step: CortexStep<any>, userName: string) {
  step = await withSoulStoreOrRag(step);

  step = await step.next(
    internalMonologue(
      `Julio thinks of an answer to ${userName}'s question based on what was just remembered as a relevant memory.`
    ),
    {
      model: "quality",
    }
  );

  return step;
}

async function withSoulStoreOrRag(step: CortexStep<any>) {
  const { log } = useActions();
  const { search } = useSoulStore();
  const { withRagContext } = useRag("super-julio");

  let highSimilarityAnswer;
  const lastMemory = getLastMemory(step);
  if (lastMemory) {
    log("Trying to find a question-answer pair in the soul store");
    const answer = await search(lastMemory);
    highSimilarityAnswer =
      answer
        .find((a) => a.similarity >= 0.8)
        ?.content?.toString()
        .trim() || null;
  }

  if (highSimilarityAnswer) {
    log("Found a high similarity answer in the soul store");
    step = step.withMemory(
      createNewMemory(prompt`
        Julio remembers:
        ${highSimilarityAnswer}
      `)
    );
  } else {
    log("No answer found, using RAG context");
    step = await withRagContext(step);
  }

  return step;
}

async function thinkOfReplyWithoutRag(step: CortexStep<any>, userName: string) {
  const julioEmotions = useSoulMemory("emotionalState", defaultEmotion);

  step = await step.next(
    internalMonologue(
      `Feeling ${julioEmotions.current.emotion}, Julio thinks of a response to ${userName}.`
    ),
    {
      model: "quality",
    }
  );

  return step;
}

async function saySomething(step: CortexStep<any>, discordEvent?: DiscordEventData) {
  const { log, dispatch } = useActions();

  const maxMessages = 3;
  const avgWordsInMessage = 40;

  const lastThought = getLastMemory(step);
  const lastThoughtWordCount = lastThought?.split(" ").length;
  const thoughtToSpeechRatio = 1.2;
  const targetResponseWordCount =
    Math.min(lastThoughtWordCount ?? avgWordsInMessage) * thoughtToSpeechRatio;
  const parts = Math.min(Math.ceil(targetResponseWordCount / avgWordsInMessage), maxMessages);

  for (let i = 1; i <= parts; i++) {
    const maxWords = avgWordsInMessage + Math.floor(random() * 40) - 20;

    log(`Message ${i}/${parts} with ${maxWords} words`);
    const message = `Julio speaks part ${i} of ${parts} of what he just thought, using no more than ${maxWords} words.`;
    const { stream, nextStep } = await step.next(externalDialog(message), {
      stream: true,
      model: "quality",
    });

    const actionConfig: ActionConfig = {
      type: "says",
      sendAs: i === 1 ? "reply" : "message",
    };

    dispatch({
      action: "says",
      content: stream,
      _metadata: {
        discordEvent,
        actionConfig,
      },
    });

    step = await nextStep;

    if (i < parts) {
      const hasFinished = await step.compute(
        mentalQuery("Julio said everything he just thought."),
        {
          model: "quality",
        }
      );

      if (hasFinished) {
        log("Julio already finished his train of thought.");
        break;
      }
    }
  }

  return step;
}

export default initialProcess;
