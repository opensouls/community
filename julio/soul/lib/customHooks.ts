import { CortexStep } from "socialagi";
import { VectorRecordWithSimilarity, useActions, useRag, useSoulStore } from "soul-engine";
import { prompt } from "./prompt.js";
import { getLastMessageFromUser, newMemory } from "./utils.js";

export async function withSoulStoreOrRag(step: CortexStep<any>) {
  const { log } = useActions();
  const { search } = useSoulStore();
  const { withRagContext } = useRag("super-julio");

  let highSimilarityAnswer;
  const lastMessageFromUser = getLastMessageFromUser(step);
  if (lastMessageFromUser) {
    const answers = (await search(lastMessageFromUser)).slice().map(
      // less confusing if we call it distance
      (answer) => ({ ...answer, distance: answer.similarity })
    );

    log(
      `Preemptively searching question-answer pairs in the soul store for "${lastMessageFromUser}". Results:`,
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
    log(`Found a high similarity answer in the soul store"`);
    step = step.withMemory(
      newMemory(prompt`
        Julio remembers:
        ${highSimilarityAnswer}
      `)
    );
  } else {
    log("No high similarity answer found, loading RAG context");
    step = await withRagContext(step);
  }

  return step;
}
