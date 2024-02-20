import { CortexStep } from "socialagi";
import { VectorRecordWithSimilarity, useActions, useSoulStore } from "soul-engine";
import { prompt } from "./prompt.js";
import { getLastMessageFromUserRole, newMemory } from "./utils.js";

type VectorRecordWithDistance = VectorRecordWithSimilarity & { distance: number };

export async function withSoulStoreContext(step: CortexStep<any>) {
  const { log } = useActions();
  const { search } = useSoulStore();

  const lastMessageFromUser = getLastMessageFromUserRole(step);
  const lastMessageContent = lastMessageFromUser?.content;
  if (!lastMessageContent) {
    return step;
  }

  const answers = (await search(lastMessageContent)).slice().map(
    // less confusing if we call it distance
    (answer) => ({ ...answer, distance: answer.similarity })
  );

  log(`Searching question-answer pairs in the soul store for "${lastMessageContent}"...`);

  const bestAnswers = (
    answers
      .filter((a) => a.distance < 0.9)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3) as VectorRecordWithDistance[]
  ).map((a) => ({ ...a, content: a.content?.toString().trim() || "" }));

  bestAnswers.forEach((answer, index) => {
    log(`Best answer ${index + 1}: ${answer.distance} ${answer.content}`);
  });

  if (bestAnswers.length > 0) {
    log(`Adding high similarity content to memory`);
    const content = bestAnswers.map((a) => a.content).join("\n\n");

    step = step.withMemory(
      newMemory(prompt`
          Julio remembers:
          ${content}
        `)
    );
  } else {
    log(`No additional context to remember`);
  }

  return step;
}
