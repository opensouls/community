import { decision, internalMonologue } from "socialagi";
import { MentalProcess, useActions, useSoulMemory } from "soul-engine";
import { humanEmotions } from "../lib/emotions.js";
import { prompt } from "../lib/prompt.js";

export const defaultEmotion = {
  emotion: "happy",
  why: "Julio is happy to be chatting with folks.",
};

const emotionalSystem: MentalProcess = async ({ step: initialStep }) => {
  const { log: engineLog } = useActions();
  const log = (...args: any[]) => {
    engineLog("[emotionalSystem]", ...args);
  };

  log("Loading soul memory");
  const julioEmotions = useSoulMemory("emotionalState", defaultEmotion);
  const allEmotions = humanEmotions.join(", ");

  log("Emotional step", julioEmotions.current);
  const emotionalStep = await initialStep.next(
    internalMonologue(
      prompt`
        Julio currently feels: ${julioEmotions.current.emotion}.
        Has anything happened that would change how Julio feels?
        Respond with how Julio is feeling. Make sure to include one of these emotions: ${allEmotions} and a very short sentence as to why Julio feels that way.
      `,
      "felt"
    )
  );
  log("Julio feels", emotionalStep.value);

  log("Computing emotion");
  const extractedEmotion = await emotionalStep.compute(
    decision("Extract the emotion that Julio just said they are feeling.", humanEmotions)
  );
  log("Julio feels", extractedEmotion);

  julioEmotions.current = {
    emotion: extractedEmotion.toString(),
    why: emotionalStep.value,
  };

  return initialStep;
};

export default emotionalSystem;
