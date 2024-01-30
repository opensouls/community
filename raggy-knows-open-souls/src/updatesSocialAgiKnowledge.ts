
import { MentalProcess, useActions, useRag } from "soul-engine";

const updatesSocialAgiKnowledge: MentalProcess = async ({ step }) => {
  const { withRagContext } = useRag("example-raggy-knows-open-souls")
  const { log } = useActions()

  log("updating the working memory with knowledge from RAG")

  return withRagContext(step)
}

export default updatesSocialAgiKnowledge
