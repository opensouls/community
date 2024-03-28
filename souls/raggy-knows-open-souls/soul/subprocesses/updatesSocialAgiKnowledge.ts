
import { MentalProcess, useActions, useRag } from "@opensouls/engine";

const updatesSocialAgiKnowledge: MentalProcess = async ({ workingMemory }) => {
  const { withRagContext } = useRag("example-raggy-knows-open-souls")
  const { log } = useActions()

  log("updating the working memory with knowledge from RAG")

  return withRagContext(workingMemory)
}

export default updatesSocialAgiKnowledge
