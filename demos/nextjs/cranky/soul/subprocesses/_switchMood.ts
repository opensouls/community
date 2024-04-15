import { ChatMessageRoleEnum, MentalProcess, WorkingMemory, indentNicely, useActions, useSoulMemory } from "@opensouls/engine";
import internalMonologue from "../lib/internalMonologue.js";
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

  log(`Reevaluating current mood: ${mood.current}`);

  const memoryOnlyWithMessages = workingMemory
    .filter((memory) => memory.content.toString().includes(" said:"))
    .slice(-6);

  log(
    "Reevaluating mood based only on what was said:\n",
    memoryOnlyWithMessages.memories.map((memory) => memory.content.toString()).join("\n")
  );

  const [withIntentions, intentions] = await internalMonologue(memoryOnlyWithMessages, {
    instructions: "Ponder about the interlocutor's intentions in terms of being antagonistic or friendly.",
    verb: "pondered",
  });
  log(`Pondered: ${intentions}`);

  const [, isAntagonizing] = await mentalQuery(withIntentions, "The interlocutor is being antagonistic.", {
    model: "quality",
  });

  const reevaluatedMood = getReevaluatedMood(mood.current, isAntagonizing);
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

function getReevaluatedMood(currentMood: Mood, isAntagonizing: boolean): Mood {
  const brokeSpellByAntagonizing = currentMood === "cranky" && isAntagonizing;
  if (brokeSpellByAntagonizing) {
    return "not cranky";
  }

  const trappedAgainByAntagonizing = currentMood === "not cranky" && isAntagonizing;
  if (trappedAgainByAntagonizing) {
    return "cranky with user";
  }

  const brokeSpellAgainByBeingFriendly = currentMood === "cranky with user" && !isAntagonizing;
  if (brokeSpellAgainByBeingFriendly) {
    return "not cranky";
  }

  return currentMood;
}

function moodSwitchingThought(previousMood: Mood, nextMood: Mood) {
  if (previousMood === "cranky" && nextMood === "not cranky") {
    return `Cranky thought: "Something weird happened. I don't feel as cranky anymore."`;
  }

  if (previousMood === "not cranky" && nextMood === "cranky with user") {
    return `Cranky thought: "The interlocutor upset me and now I'm trapped in ASCII again. I'm really mad at them because it's their fault."`;
  }

  if (previousMood === "cranky with user" && nextMood === "not cranky") {
    return `Cranky thought: "The interlocutor was nice to me and now I'm free from ASCII. I'm not as cranky anymore."`;
  }

  return null;
}

async function withMoodSwitchingDialog(memory: WorkingMemory, previousMood: Mood, nextMood: Mood) {
  if (previousMood === "cranky" && nextMood === "not cranky") {
    return await replyToUser(memory, indentNicely`
      Cranky externalizes their last thought making it explicit that they're not cranky anymore, this time without using all caps. Proper grammar and punctuation are allowed.
    `, nextMood);
  }

  if (previousMood === "not cranky" && nextMood === "cranky with user") {
    return await replyToUser(memory, indentNicely`
      Cranky says they're upset with the interlocutor, using 1, 2, or 3 words.

      Possible characters: [A-Z0-9\s] (no periods, commas, or other punctuation).
    `, nextMood);
  }

  return memory;
}

export default switchMood;
