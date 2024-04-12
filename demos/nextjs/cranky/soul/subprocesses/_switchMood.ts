import { MentalProcess, useActions, useSoulMemory } from "@opensouls/engine";
import internalMonologue from "../lib/internalMonologue.js";
import mentalQuery from "../lib/mentalQuery.js";
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

  const memoryOnlyWithMessages = workingMemory.filter((memory) => memory.content.toString().includes(" said:"));
  log(
    "Reevaluating mood based only on what was said:\n",
    memoryOnlyWithMessages.memories.map((memory) => memory.content.toString()).join("\n")
  );

  const [withIntentions, intentions] = await internalMonologue(memoryOnlyWithMessages, {
    instructions: "Ponder about the interlocutor's intentions in terms of being antagonistic or friendly. Cranky loves to be antagonized.",
    verb: "pondered",
  });
  log(`Pondered: ${intentions}`);

  const [, isAntagonizing] = await mentalQuery(withIntentions, "The interlocutor is being antagonistic.", {
    model: "quality",
  });

  const reevaluatedMood = isAntagonizing ? "not cranky" : "cranky";
  log(
    `Reevaluated mood: ${reevaluatedMood}. ${
      reevaluatedMood === "cranky" ? "Cranky hates friendly people." : "Cranky likes to be antagonized."
    }`
  );

  if (reevaluatedMood !== mood.current) {
    mood.current = reevaluatedMood;

    dispatch({
      action: "switchMood",
      content: mood.current,
    });  
  }

  return workingMemory;
};

export default switchMood;
