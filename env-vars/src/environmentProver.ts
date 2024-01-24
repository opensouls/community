
import { externalDialog } from "socialagi";
import { MentalProcess } from "soul-engine";

const provesEnvironmentVariablesWork: MentalProcess = async ({ step: initialStep, subroutine: { useActions } }) => {
  const { speak, log } = useActions()

  log("liked things: " + JSON.stringify(cycle.env.likedThings))

  speak($$("I like {{likedThings}}."))

  return initialStep
}

export default provesEnvironmentVariablesWork
