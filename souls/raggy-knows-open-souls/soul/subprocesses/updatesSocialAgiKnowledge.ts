
import { MentalProcess, useActions } from "@opensouls/engine";
import withRagContext from "../cognitiveFunctions/withRagContext";

const updatesSocialAgiKnowledge: MentalProcess = async ({ workingMemory }) => {
  const { log } = useActions()

  log("updating the working memory with knowledge from RAG")

  return withRagContext(workingMemory)
}

export default updatesSocialAgiKnowledge
