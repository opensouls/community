import { MentalProcess, Perception, WorkingMemory, useActions, usePerceptions, useSoulMemory } from "@opensouls/engine";
import { DiscordEventData } from "../discord/soulGateway.js";
import decision from "./lib/decision.js";
import externalDialog from "./lib/externalDialog.js";
import { getMetadataFromPerception, getUserDataFromDiscordEvent } from "./lib/utils/discord.js";
import { newMemory } from "./lib/utils/memory.js";

const initialProcess: MentalProcess = async ({ workingMemory: memory }) => {
  const { log, dispatch } = useActions();
  const { invokingPerception, pendingPerceptions } = usePerceptions();
  const { userName, discordEvent } = getMetadataFromPerception(invokingPerception);

  let stream;

  const hasReachedPendingPerceptionsLimit = pendingPerceptions.current.length > 10;
  if (hasReachedPendingPerceptionsLimit) {
    log("Pending perceptions limit reached. Skipping perception.");
    return memory;
  }

  const isMessageBurst = hasMoreMessagesFromSameUser(pendingPerceptions.current, userName);
  if (isMessageBurst) {
    log(`Skipping perception from ${userName} because it's part of a message burst`);
    return memory;
  }

  let step = rememberUser(memory, discordEvent);

  const shouldReply = await isUserTalkingToSchmoozie(invokingPerception, step, userName);
  if (!shouldReply) {
    log(`Ignoring message from ${userName} because they're not talking to Schmoozie`);
    return memory;
  }

  const userSentNewMessagesInMeantime = hasMoreMessagesFromSameUser(pendingPerceptions.current, userName);
  if (userSentNewMessagesInMeantime) {
    log(`Aborting response to ${userName} because they've sent more messages in the meantime`);
    return memory;
  }

  log(`Answering message from ${userName}`);
  [memory, stream] = await externalDialog(memory, `Schmoozie answers ${userName}'s message`, {
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

  await memory.finished;

  return memory;
};

function hasMoreMessagesFromSameUser(pendingPerceptions: Perception[], userName: string) {
  const countOfPendingPerceptionsBySamePerson = pendingPerceptions.filter((perception) => {
    return getMetadataFromPerception(perception)?.userName === userName;
  }).length;

  return countOfPendingPerceptionsBySamePerson > 0;
}

async function isUserTalkingToSchmoozie(
  perception: Perception | undefined | null,
  memory: WorkingMemory,
  userName: string
) {
  const { log } = useActions();

  const discordUserId = soul.env.discordUserId?.toString();
  if (discordUserId && perception && perception.content.includes(`<@${discordUserId}>`)) {
    log(`User at-mentioned Schmoozie, will reply`);
    return true;
  }

  const [, interlocutor] = await decision(
    memory,
    {
      description: `Schmoozie is the moderator of this channel. Participants sometimes talk to Schmoozie, and sometimes between themselves. In this last message sent by ${userName}, guess which person they are probably speaking with.`,
      choices: ["schmoozie, for sure", "schmoozie, possibly", "someone else", "not sure"],
    },
    {
      model: "quality",
    }
  );

  log(`Schmoozie decided that ${userName} is talking to: ${interlocutor}`);

  return interlocutor.toString().startsWith("schmoozie");
}

function rememberUser(memory: WorkingMemory, discordEvent: DiscordEventData | undefined) {
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
    memory = memory.withMemory(newMemory(remembered));
  } else {
    log(`No memory about ${userName}`);
  }

  return memory;
}

export default initialProcess;
