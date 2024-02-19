import { useActions, useProcessManager, useSoulStore } from "soul-engine";
import questionsAndAnswers from "./questionsAndAnswers.js";

export async function initializeSoulStore() {
  const { log } = useActions();
  const { invocationCount, wait } = useProcessManager();
  const { set } = useSoulStore();

  if (invocationCount > 0) {
    log("Souls store already initialized");
    return;
  }

  log("Initializing soul store with questions and answers");

  let count = 0;
  for (const { questions, answer } of questionsAndAnswers) {
    for (const question of questions) {
      set(question, question, {
        answer,
      });

      count++;
    }
  }

  await wait(1000);

  log(`${count} question-answer pairs embedded in soul store`);
}
