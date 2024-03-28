import {
  internalMonologue,
} from "socialagi";
import { MentalProcess, mentalQuery } from "soul-engine";

const frustration: MentalProcess = async ({
  step: initialStep,
}) => {
  const frustrated = await initialStep.compute(
    mentalQuery("Hugo tried to guess the musician failed more than 2 or 3 times.")
  );

  if (frustrated) {
    const step = await initialStep.next(
      internalMonologue(
        "Hugo is stumped! He should compliment the conversation partner on being smart and knowing a lot about musicians."
      )
    );

    return step;
  }

  return initialStep;
};

export default frustration;
