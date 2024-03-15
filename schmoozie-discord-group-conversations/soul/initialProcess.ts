import { CortexStep, decision, externalDialog } from "socialagi";
import { MentalProcess, useActions, usePerceptions, useSoulMemory } from "soul-engine";
import { Perception } from "soul-engine/soul";
import { DiscordEventData } from "../discord/soulGateway.js";
import { getMetadataFromPerception, getUserDataFromDiscordEvent, newMemory } from "./lib/utils.js";

const initialProcess: MentalProcess = async ({ step: initialStep }) => {
  const { log, dispatch } = useActions();
  const { invokingPerception, pendingPerceptions } = usePerceptions();
  const { userName, discordEvent } = getMetadataFromPerception(invokingPerception);

  const hasReachedPendingPerceptionsLimit = pendingPerceptions.current.length > 10;
  if (hasReachedPendingPerceptionsLimit) {
    log("Pending perceptions limit reached. Skipping perception.");
    return initialStep;
  }

  const isMessageBurst = hasMoreMessagesFromSameUser(pendingPerceptions.current, userName);
  if (isMessageBurst) {
    log(`Skipping perception from ${userName} because it's part of a message burst`);
    return initialStep;
  }

  let step = rememberUser(initialStep, discordEvent);

  const interlocutor = await step.compute(
    decision(
      `Schmoozie is the moderator of this channel. Participants sometimes talk to Schmoozie, and sometimes between themselves. In this last message sent by ${userName}, guess which person they are probably speaking with.`,
      ["schmoozie, for sure", "schmoozie, possibly", "someone else", "not sure"]
    ),
    {
      model: "quality",
    }
  );

  log(`Schmoozie thinks ${userName} is talking to: ${interlocutor}`);

  const isUserTalkingToSchmoozie = interlocutor.toString().startsWith("schmoozie");
  if (!isUserTalkingToSchmoozie) {
    log(`Ignoring message from ${userName} because they're not talking to Schmoozie`);
    return initialStep;
  }

  const userSentNewMessagesInMeantime = hasMoreMessagesFromSameUser(pendingPerceptions.current, userName);
  if (userSentNewMessagesInMeantime) {
    log(`Aborting response to ${userName} because they've sent more messages in the meantime`);
    return initialStep;
  }

  log(`Answering message from ${userName}`);
  const { stream, nextStep } = await step.next(externalDialog(`Schmoozie answers ${userName}'s message`), {
    stream: true,
    model: "quality",
  });

  dispatch({
    action: "says",
    content: stream,
    _metadata: {
      discordEvent,
    },
  });

  return await nextStep;
};

function hasMoreMessagesFromSameUser(pendingPerceptions: Perception[], userName: string) {
  const countOfPendingPerceptionsBySamePerson = pendingPerceptions.filter((perception) => {
    return getMetadataFromPerception(perception)?.userName === userName;
  }).length;

  return countOfPendingPerceptionsBySamePerson > 0;
}

function rememberUser(step: CortexStep<any>, discordEvent: DiscordEventData | undefined) {
  const { log } = useActions();
  const { userName, userDisplayName } = getUserDataFromDiscordEvent(discordEvent);

  const userModel = useSoulMemory(userName, `- Display name: "${userDisplayName}"`);
  const userLastMessage = useSoulMemory(userName + "-lastMessage", "");

  let remembered = "";

  if (userModel.current) {
    remembered += userModel.current;
  }

  if (userLastMessage.current) {
    remembered += `\n\nThe last message Schmoozie sent to ${userName} was:\n- ${userLastMessage.current}`;
  }

  remembered = remembered.trim();

  if (remembered.length > 0) {
    log(`Remembered this about ${userName}:\n${remembered}`);

    remembered = `Schmoozie remembers this about ${userName}:\n${remembered.trim()}`;
    step = step.withMemory(newMemory(remembered));
  } else {
    log(`No memory about ${userName}`);
  }

  return step;
}

export default initialProcess;
