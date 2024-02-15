import { CortexStep, externalDialog, internalMonologue, mentalQuery } from "socialagi";
import {
  MentalProcess,
  VectorRecordWithSimilarity,
  useActions,
  usePerceptions,
  useProcessManager,
  useRag,
  useSoulMemory,
  useSoulStore,
} from "soul-engine";
import { Perception } from "soul-engine/soul";
import { DiscordEventData, SoulActionConfig } from "../discord/soulGateway.js";
import { emojiReaction } from "./lib/emojiReact.js";
import { prompt } from "./lib/prompt.js";
import questionsAndAnswers from "./lib/questionsAndAnswers.js";
import {
  newMemory as createNewMemory,
  getDiscordActionFromPerception,
  getLastMemory,
  getLastMessageFromUser,
  getMetadataFromPerception,
  getUserDataFromDiscordEvent,
  random,
} from "./lib/utils.js";
import { defaultEmotion } from "./subprocesses/emotionalSystem.js";

const initialProcess: MentalProcess = async ({ step: initialStep }) => {
  const { invokingPerception, pendingPerceptions } = usePerceptions();
  const { userName, discordEvent } = getMetadataFromPerception(invokingPerception);

  if (shouldSkipPerception(pendingPerceptions.current, userName)) {
    return initialStep;
  }

  await initialize();

  let step = await rememberUser(initialStep, discordEvent);

  if (shouldWelcomeUser(invokingPerception)) {
    step = await thinkOfWelcomeMessage(step, userName);
  } else {
    step = await thinkOfReplyMessage(step, userName, discordEvent);
  }

  return await saySomething(step, discordEvent);
};

function shouldSkipPerception(pendingPerceptions: Perception[], userName: string) {
  const { log } = useActions();

  log("Pending perceptions count:", pendingPerceptions.length);

  const maximumQueuedPerceptions = 10;
  const tooManyPendingPerceptions = pendingPerceptions.length > maximumQueuedPerceptions;
  if (tooManyPendingPerceptions) {
    log("Skipping perception due to too many pending perceptions");
    return true;
  }

  const isMessageBurstBySamePerson = pendingPerceptions.some((perception) => {
    return getMetadataFromPerception(perception)?.userName === userName;
  });
  if (isMessageBurstBySamePerson) {
    log(`Skipping perception from ${userName} due to message burst`);
    return true;
  }

  return false;
}

async function initialize() {
  const { invocationCount } = useProcessManager();

  if (invocationCount === 0) {
    await initializeSoulStore();
  }
}

async function initializeSoulStore() {
  const { log } = useActions();
  const { wait } = useProcessManager();
  const { set } = useSoulStore();

  log("Initializing soul store with questions and answers");

  let count = 0;
  for (const { questions, answer } of questionsAndAnswers) {
    for (const question of questions) {
      set(question, question, {
        answer,
      });

      count++;
    }
  }

  await wait(1000);

  log(`${count} question-answer pairs embedded in soul store`);
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

function shouldWelcomeUser(perception: Perception | undefined | null) {
  const action = getDiscordActionFromPerception(perception);
  const isJoinActionFromDiscord = action === "joined";
  const isSimulatedJoinActionFromDebug = perception?.content === "JOINED";
  const shouldWelcomeUser = isJoinActionFromDiscord || isSimulatedJoinActionFromDebug;
  return shouldWelcomeUser;
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
        - ${userName} needs to know that the name of the place we are now is "the welcome area"
        - ${userName} should check out satoshi street
        - if ${userName} is a holder, they should go to #🔳-holder-verify so they can join the collector's corner
        - no other channel or area should be mentioned now!!!"
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

  const actionConfig: SoulActionConfig = {
    type: "reacts",
    sendAs: "emoji",
  };

  dispatch({
    action: actionConfig.type,
    content: emoji,
    _metadata: {
      discordEvent,
      actionConfig,
    },
  });

  const ragTopics = "Julio, Super Julio World, Julio's Discord Server, or Bitcoin Ordinals";
  const needsRagContext = await step.compute(
    mentalQuery(`${userName} has asked a question about ${ragTopics}`),
    { model: "quality" }
  );

  if (needsRagContext) {
    step = await thinkOfReplyWithAdditionalContext(step, userName);
  } else {
    step = await thinkOfSimpleReply(step, userName);
  }

  return step;
}

async function thinkOfReplyWithAdditionalContext(step: CortexStep<any>, userName: string) {
  const { log } = useActions();

  log("Additional context is needed to answer the question");

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
  const lastMessageFromUser = getLastMessageFromUser(step);
  if (lastMessageFromUser) {
    log(`Searching question-answer pairs in the soul store for "${lastMessageFromUser}"`);
    const answers = (await search(lastMessageFromUser)).slice().map(
      // less confusing if we call it distance
      (answer) => ({ ...answer, distance: answer.similarity })
    );

    log(
      "Search results:",
      answers
        .sort((a, b) => a.distance - b.distance)
        .map((a) => a.distance + " " + a.content?.toString().trim())
        .slice(0, 3)
    );

    const bestAnswer = (answers
      .filter((a) => a.distance <= 0.3)
      .sort((a, b) => a.distance - b.distance)
      .shift() ?? null) as VectorRecordWithSimilarity | null;

    highSimilarityAnswer = bestAnswer?.metadata?.answer?.toString().trim();
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

async function thinkOfSimpleReply(step: CortexStep<any>, userName: string) {
  const { log } = useActions();

  log("Question can be answered with a simple reply");

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

    log(`Message ${i}/${parts} with ${maxWords} words max`);
    const message = `Julio speaks part ${i} of ${parts} of what he just thought, using no more than ${maxWords} words.`;
    const { stream, nextStep } = await step.next(externalDialog(message), {
      stream: true,
      model: "quality",
    });

    const actionConfig: SoulActionConfig = {
      type: "says",
      sendAs: i === 1 ? "reply" : "message",
    };

    dispatch({
      action: actionConfig.type,
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
