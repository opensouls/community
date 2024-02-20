import { CortexStep } from "socialagi";
import { VectorRecordWithSimilarity, useActions, useSoulStore } from "soul-engine";
import { prompt } from "./prompt.js";
import { getLastMessageFromUserRole, newMemory } from "./utils.js";

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

  log(
    `Preemptively searching question-answer pairs in the soul store for "${lastMessageContent}". Results:`,
    answers
      .sort((a, b) => a.distance - b.distance)
      .map((a) => a.distance + " " + a.content?.toString().trim())
      .slice(0, 3)
  );

  const bestAnswer = (answers
    .filter((a) => a.distance <= 0.3)
    .sort((a, b) => a.distance - b.distance)
    .shift() ?? null) as VectorRecordWithSimilarity | null;

  const highSimilarityAnswer = bestAnswer?.metadata?.answer?.toString().trim();

  if (highSimilarityAnswer) {
    log(`Adding high similarity content to memory"`);
    step = step.withMemory(
      newMemory(prompt`
          Julio remembers:
          ${highSimilarityAnswer}
        `)
    );
  } else {
    log(`No additional context to remember`);
  }

  return step;
}
