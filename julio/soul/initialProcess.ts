import { CortexStep, decision, externalDialog, internalMonologue } from "socialagi";
import { MentalProcess, useActions, usePerceptions, useSoulMemory } from "soul-engine";
import { Perception } from "soul-engine/soul";
import { DiscordEventData, SoulActionConfig } from "../discord/soulGateway.js";
import { withSoulStoreContext } from "./lib/customHooks.js";
import { emojiReaction } from "./lib/emojiReact.js";
import { initializeSoulStore } from "./lib/initialization.js";
import { prompt } from "./lib/prompt.js";
import {
  getDiscordActionFromPerception,
  getLastMemory,
  getMetadataFromPerception,
  getUserDataFromDiscordEvent,
  isRunningInDiscord,
  newMemory,
  random,
} from "./lib/utils.js";

const initialProcess: MentalProcess = async ({ step: initialStep }) => {
  const { log } = useActions();
  const { invokingPerception, pendingPerceptions } = usePerceptions();
  const { userName, discordEvent } = getMetadataFromPerception(invokingPerception);

  if (hasReachedPendingPerceptionsLimit(pendingPerceptions.current)) {
    log("Skipping perception due to pending perceptions limit");
    return initialStep;
  }

  const isMessageBurst = hasMoreMessagesFromSameUser(pendingPerceptions.current, userName);
  if (isMessageBurst) {
    log(`Skipping perception from ${userName} due to message burst`);
    return initialStep;
  }

  let time = Date.now();

  await initializeSoulStore();

  let step = rememberUser(initialStep, discordEvent);

  let isWelcome = false;
  if (shouldWelcomeUser(invokingPerception)) {
    step = await thinkOfWelcomeMessage(step, userName);
    isWelcome = true;
  } else {
    const [isTalkingToJulio, nextStep] = await Promise.all([
      isUserTalkingToJulio(step, userName),
      thinkOfReplyMessage(step, userName),
      reactWithEmoji(step, discordEvent),
    ]);

    if (!isTalkingToJulio) {
      log(`Skipping perception from ${userName} because they're talking to someone else`);
      return initialStep;
    }

    step = nextStep;

    const userSentNewMessagesInMeantime = hasMoreMessagesFromSameUser(pendingPerceptions.current, userName);
    if (userSentNewMessagesInMeantime) {
      log(`Skipping perception from ${userName} because they've sent more messages in the meantime`);
      return initialStep;
    }
  }

  const isGroupConversation = pendingPerceptions.current.some((perception) => {
    return getMetadataFromPerception(perception).userName !== userName;
  });

  time = Date.now() - time;
  log(`Time until beginning of response: ${time}ms`);

  const sendAsUserReply = isGroupConversation || isWelcome;
  return await saySomething(step, discordEvent, sendAsUserReply);
};

function hasReachedPendingPerceptionsLimit(pendingPerceptions: Perception[]) {
  const { log } = useActions();
  log("Total pending perceptions:", pendingPerceptions.length);

  const maximumQueuedPerceptions = 10;
  return pendingPerceptions.length > maximumQueuedPerceptions;
}

function hasMoreMessagesFromSameUser(pendingPerceptions: Perception[], userName: string) {
  const { log } = useActions();

  const countOfPendingPerceptionsBySamePerson = pendingPerceptions.filter((perception) => {
    return getMetadataFromPerception(perception)?.userName === userName;
  }).length;

  log(`Pending perceptions from ${userName}: ${countOfPendingPerceptionsBySamePerson}`);

  return countOfPendingPerceptionsBySamePerson > 0;
}

function rememberUser(step: CortexStep<any>, discordEvent: DiscordEventData | undefined) {
  const { log } = useActions();

  const { userName, userDisplayName } = getUserDataFromDiscordEvent(discordEvent);

  log("Remembering user");
  const userModel = useSoulMemory(userName, `- Display name: "${userDisplayName}"`);
  const userLastMessage = useSoulMemory(userName + "-lastMessage", "");

  let remembered = "";

  if (userModel.current) {
    remembered += userModel.current;
  }

  if (userLastMessage.current) {
    remembered += `\n\nThe last message Julio sent to ${userName} was:\n- ${userLastMessage.current}`;
  }

  remembered = remembered.trim();

  if (remembered.length > 0) {
    remembered = `Julio remembers this about ${userName}:\n${remembered.trim()}`;
    step = step.withMemory(newMemory(remembered));

    log(remembered);
  } else {
    log(`Julio has no memories involving ${userName} `);
  }

  return step;
}

function shouldWelcomeUser(perception: Perception | undefined | null) {
  const action = getDiscordActionFromPerception(perception);
  const isJoinActionFromDiscord = action === "joined";
  const isSimulatedJoinActionFromDebug = !isRunningInDiscord(perception) && perception?.content === "JOINED";
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
    newMemory(
      prompt(`
        Julio thought: "${thought} oh and I CANNOT FORGET to mention these SUPER IMPORTANT things:
        - i'll tell ${userName} that there are 3 levels in the server: welcome area, satoshi street, and collector's corner
        - ${userName} should also know that the name of the place we are now is "the welcome area"
        - ${userName} should check out satoshi street
        - if ${userName} is a holder, they should go to channel ${soul.env.holderVerifyChannel} so they can join the collector's corner
        - no other channel or area should be mentioned now!!!"
      `)
    )
  );

  return step;
}

async function isUserTalkingToJulio(step: CortexStep<any>, userName: string) {
  const { log } = useActions();

  const messageTarget = await step.compute(
    decision(
      `Julio is the moderator of this channel. Participants sometimes talk to Julio, and sometimes between themselves. In this last message sent by ${userName}, guess which person they are probably speaking with.`,
      ["julio, for sure", "julio, possibly", "someone else", "not sure"]
    ),
    {
      model: "quality",
    }
  );

  log(`Julio decided that ${userName} is talking to: ${messageTarget}`);

  if (messageTarget === "not sure") {
    const chimeIn = random() < 0.5;

    log(`Not sure if ${userName} is talking to Julio, chime in? ${chimeIn ? "yes" : "no"}`);
    return chimeIn;
  }

  return messageTarget.toString().startsWith("julio");
}

async function thinkOfReplyMessage(step: CortexStep<any>, userName: string) {
  step = await withSoulStoreContext(step);

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

async function reactWithEmoji(step: CortexStep<any>, discordEvent: DiscordEventData | undefined) {
  const { log, dispatch } = useActions();

  if (random() < 0.333) {
    log("Skipping emoji reaction");
    return;
  }

  log("Thinking of an emoji to react with");
  const emoji = await step.compute(emojiReaction());

  const actionConfig: SoulActionConfig = {
    type: "reacts",
    sendAs: "emoji",
  };

  log(`Reacting with ${emoji}`);
  dispatch({
    action: actionConfig.type,
    content: emoji,
    _metadata: {
      discordEvent,
      actionConfig,
    },
  });
}

async function saySomething(
  step: CortexStep<any>,
  discordEvent: DiscordEventData | undefined,
  sendAsUserReply: boolean
) {
  const { log, dispatch } = useActions();

  const { userName } = getUserDataFromDiscordEvent(discordEvent);

  const maxMessages = 3;
  const avgWordsInMessage = 40;

  const lastThought = getLastMemory(step);
  const lastThoughtWordCount = lastThought?.split(" ").length;
  const thoughtToSpeechRatio = 1.2;
  const targetResponseWordCount = Math.min(lastThoughtWordCount ?? avgWordsInMessage) * thoughtToSpeechRatio;
  const parts = Math.min(Math.ceil(targetResponseWordCount / avgWordsInMessage), maxMessages);

  let fullMessage = "";
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
      sendAs: sendAsUserReply && i === 1 ? "reply" : "message",
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
    fullMessage += step.memories.slice(-1)[0].content.toString().split(":")[1]?.trim() + "\n";
  }

  const userLastMessage = useSoulMemory(userName + "-lastMessage", "");
  userLastMessage.current = fullMessage;

  return step;
}

export default initialProcess;
