
import { externalDialog } from "socialagi";
import { MentalProcess, useActions } from "soul-engine";

const provesEnvironmentVariablesWork: MentalProcess = async ({ step: initialStep }) => {
  const { speak, log } = useActions()

  log("liked things: " + JSON.stringify(soul.env.likedThings))
  log("entity name: " + initialStep.entityName)

  speak($$("I like {{likedThings}}."))

  return initialStep
}

export default provesEnvironmentVariablesWork
