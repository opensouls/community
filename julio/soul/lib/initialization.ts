import { useActions, useProcessManager, useSoulStore } from "soul-engine";
import content from "./content/index.js";

export async function initializeSoulStore() {
  const { log } = useActions();
  const { invocationCount } = useProcessManager();

  if (invocationCount > 0) {
    log("Souls store already initialized");
    return;
  }

  await reindexContent();
}

export async function reindexContent() {
  const { log } = useActions();
  const { set } = useSoulStore();
  const { wait } = useProcessManager();

  log("Indexing content in soul store...");

  let count = 0;
  for (const [groupKey, groupItems] of Object.entries(content)) {
    for (const [itemKey, itemContent] of Object.entries(groupItems)) {
      set(`${groupKey}-${itemKey}`, itemContent);

      count++;
    }
  }

  await wait(3000);

  log(`${count} content items embedded in soul store`);
}
