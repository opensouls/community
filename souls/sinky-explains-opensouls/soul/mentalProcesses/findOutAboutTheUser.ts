
import { externalDialog, mentalQuery } from "socialagi";
import { MentalProcess, useActions, useProcessManager } from "soul-engine";
import pitchesTheSoulEngine from "./pitchesTheSoulEngine.js";

const findsOutAboutTheUser: MentalProcess = async ({ step: initialStep }) => {
  const { speak } = useActions()
  const { setNextProcess } = useProcessManager()

  const { stream, nextStep } = await initialStep.next(
    externalDialog("Sinky tries to learn as much as they can about the user (what's their name, their programming experience, etc)."),
    { stream: true, model: "quality" }
  );
  speak(stream);

  const isReadyToMoveOn = await initialStep.compute(mentalQuery("Sinky and the user have introduced themselves and Sinky feels he knows enough about the user to move on."))
  if (isReadyToMoveOn) {
    setNextProcess(pitchesTheSoulEngine)
  }

  return nextStep
}

export default findsOutAboutTheUser
