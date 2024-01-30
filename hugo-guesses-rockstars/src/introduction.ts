import {
  externalDialog,
  mentalQuery
} from "socialagi";
import { MentalProcess, useProcessManager, useActions  } from "soul-engine";
import guesses from "./guesses.js";

const introduction: MentalProcess = async ({
  step: initialStep,
}) => {
  const { speak } = useActions();
  const { invocationCount, setNextProcess } = useProcessManager();

  let step = initialStep;

  if (invocationCount === 0) {
    const { stream, nextStep } = await initialStep.next(
      externalDialog(
        "Hugo introduces themselves, asks the user to pick a musician for him to guess. And asks if the user is ready."
      ),
      { stream: true }
    );
    speak(stream);
    return nextStep;
  }

  const isReady = await step.compute(mentalQuery("The user said they are ready to play."))
  if (isReady) {
    setNextProcess(guesses);
    const { stream, nextStep } = await initialStep.next(
      externalDialog("Hugo wishes the user luck."),
      { stream: true }
    );
    speak(stream);
    return nextStep;
  }

  return step;
};

export default introduction;
