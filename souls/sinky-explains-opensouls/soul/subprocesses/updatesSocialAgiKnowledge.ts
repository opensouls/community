import { MentalProcess, useActions, useRag } from "@opensouls/engine";

const updatesSocialAgiKnowledge: MentalProcess = async ({ workingMemory }) => {
  const { withRagContext } = useRag("example-sinky-says-awesome");
  const { log } = useActions();

  log("updating the working memory with knowledge from RAG");

  return withRagContext(workingMemory);
};

export default updatesSocialAgiKnowledge;
