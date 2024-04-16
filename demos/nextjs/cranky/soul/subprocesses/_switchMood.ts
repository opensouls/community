import {
  ChatMessageRoleEnum,
  MentalProcess,
  WorkingMemory,
  indentNicely,
  useActions,
  useSoulMemory,
} from "@opensouls/engine";
import mentalQuery from "../lib/mentalQuery.js";
import { replyToUser } from "../utils/reply-to-user.js";
import { Mood } from "../utils/types.js";

const REEVALUATE_FREQUENCY = 3;

const switchMood: MentalProcess = async ({ workingMemory }) => {
  const { log: engineLog, dispatch } = useActions();
  const log = (...args: any[]) => {
    engineLog("[switchMood]", ...args);
  };

  const switchMoodInvocationCount = useSoulMemory<number>("switchMoodInvocationCount", 0);
  const invocationCount = switchMoodInvocationCount.current;
  switchMoodInvocationCount.current = invocationCount + 1;

  log(`Invocation count: ${invocationCount}`);
  const shouldReevaluateMood = invocationCount > 0 && invocationCount % REEVALUATE_FREQUENCY === 0;
  if (!shouldReevaluateMood) {
    log("Not reevaluating mood.");
    return workingMemory;
  }

  const mood = useSoulMemory<Mood>("mood", "cranky");
  const reevaluatedMood = await reevaluateMood(workingMemory, mood.current);
  log(`Reevaluated mood: ${reevaluatedMood}.`);

  if (reevaluatedMood !== mood.current) {
    const previousMood = mood.current;
    mood.current = reevaluatedMood;

    let memory = workingMemory;

    const thought = moodSwitchingThought(previousMood, reevaluatedMood);
    if (thought) {
      memory = workingMemory.withMemory({
        role: ChatMessageRoleEnum.Assistant,
        content: thought,
      });
    }

    dispatch({
      action: "switchMood",
      content: mood.current,
    });

    return await withMoodSwitchingDialog(memory, previousMood, reevaluatedMood);
  }

  return workingMemory;
};

async function reevaluateMood(workingMemory: WorkingMemory, currentMood: Mood) {
  const { log } = useActions();
  const invocationCount = useSoulMemory<number>("switchMoodInvocationCount", 0);

  const mood = useSoulMemory<Mood>("mood", "cranky");

  log(`Reevaluating current mood: ${mood.current}`);

  const memoryOnlyWithMessages = workingMemory
    .filter((memory) => memory.content.toString().includes(" said:"))
    .slice(-6);

  log(
    "Reevaluating mood based only on what was said:\n",
    memoryOnlyWithMessages.memories.map((memory) => memory.content.toString()).join("\n")
  );

  if (currentMood === "cranky" && invocationCount.current >= 15) {
    log("Cranky has been cranky for too long. Changing mood.");
    return "less cranky";
  }

  if (currentMood === "cranky again") {
    const [, userApologized] = await mentalQuery(memoryOnlyWithMessages, "The interlocutor sincerely apologized in this conversation.", {
      model: "quality",
    });

    return userApologized ? "less cranky" : currentMood;
  }

  const [, isAntagonizing] = await mentalQuery(memoryOnlyWithMessages, "The interlocutor is being antagonistic.", {
    model: "quality",
  });

  const brokeSpellByAntagonizing = currentMood === "cranky" && isAntagonizing;
  if (brokeSpellByAntagonizing) {
    return "less cranky";
  }

  const trappedAgainByAntagonizing = currentMood === "less cranky" && isAntagonizing;
  if (trappedAgainByAntagonizing) {
    return "cranky again";
  }

  return currentMood;
}

function moodSwitchingThought(previousMood: Mood, nextMood: Mood) {
  if (previousMood === "cranky" && nextMood === "less cranky") {
    return `Cranky thought: "Something weird happened. I don't feel as cranky anymore."`;
  }

  if (previousMood === "less cranky" && nextMood === "cranky again") {
    return `Cranky thought: "The interlocutor upset me and now I'm trapped in ASCII again. I'm really mad at them because it's their fault."`;
  }

  if (previousMood === "cranky again" && nextMood === "less cranky") {
    return `Cranky thought: "The interlocutor was nice to me and now I'm free from ASCII. I'm not as cranky anymore."`;
  }

  return null;
}

async function withMoodSwitchingDialog(memory: WorkingMemory, previousMood: Mood, nextMood: Mood) {
  if (previousMood === "cranky" && nextMood === "less cranky") {
    return await replyToUser(
      memory,
      indentNicely`
      Cranky externalizes their last thought making it explicit that they're less cranky, this time without using all caps. Proper grammar and punctuation are allowed. Under 15 words.
    `,
      nextMood
    );
  }

  if (previousMood === "less cranky" && nextMood === "cranky again") {
    return await replyToUser(
      memory,
      indentNicely`
      Cranky says they're upset with the interlocutor, using 1, 2, or 3 words.

      Possible characters: [A-Z0-9\s] (no periods, commas, or other punctuation).
    `,
      nextMood
    );
  }

  return memory;
}

export default switchMood;
