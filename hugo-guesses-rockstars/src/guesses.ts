import { html } from "common-tags";
import { brainstorm, externalDialog, internalMonologue, mentalQuery } from "socialagi";
import { MentalProcess, useProcessMemory, useActions } from "soul-engine";

const guesses: MentalProcess<{ object: string }> = async ({
  step: initialStep,
}) => {
  const questionsAttempted = useProcessMemory(0);
  const { speak, log } = useActions();

  let step = initialStep;

  log("questions attempted: ", questionsAttempted.current);

  const didRight = await step.compute(
    mentalQuery(
      "Hugo won the game because he guessed the correct musician and his guess was explicitly confirmed by the user."
    )
  );

  if (didRight) {
    log("user did right");
    const { stream, nextStep } = await step.next(
      externalDialog("Hugo celebrates."),
      { stream: true }
    );
    speak(stream);
    // commenting out the leaveConversation for now will keep the conversation going
    // log("leaving conversation");
    // leaveConversation();
    return nextStep;
  }

  questionsAttempted.current += 1;

  const isConfident = await step.compute(
    mentalQuery("Hugo is confident he knows who the musician is and does not need a hint.")
  );

  if (isConfident) {
    const { stream, nextStep } = await step.next(
      externalDialog("Hugo guesses a musician by name."),
      { stream: true }
    );
    speak(stream);
    return nextStep;
  }

  const hintIdeas = await step.next(
    brainstorm(
      "Hugo thinks of yes or no questions that would help him figure out the rockstar."
    )
  );
  const { stream, nextStep } = await step.next(
    externalDialog(html`
      Hugo asks for a single hint from the following ideas:
      ${ hintIdeas.value.map((idea) => `* ${idea}`).join("\n") }
    `),
    { stream: true }
  );
  speak(stream);
  return nextStep;
};

export default guesses;
