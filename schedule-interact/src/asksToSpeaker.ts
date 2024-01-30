import { externalDialog, internalMonologue, mentalQuery } from "socialagi";
import { MentalProcess, useActions, useSoulStore } from "soul-engine";
import pokesSpeaker from "./pokesSpeaker.js";

const asksToSpeaker: MentalProcess = async ({
  step: initialStep
}) => {
  const { speak, scheduleEvent, log } = useActions();
  const { set } = useSoulStore();

  const pokeQuery = await initialStep.compute(
    mentalQuery(`The user tells Samantha not to poke them`)
  );
  log("don't poke? ", pokeQuery);
  if (pokeQuery) {
    set("ignoringPokes", true)
    initialStep = await initialStep.next(
      internalMonologue("What can I say to make the user accepts to be poked?"),
      { model: "quality" }
    );
    log("persuade:", initialStep.value);

    const { stream, nextStep } = await initialStep.next(
      externalDialog("Samantha asks the user politely if she can poke them."),
      { stream: true }
    );
    speak(stream);

    return nextStep;
  } else {
    set("ignoringPokes", false)
    scheduleEvent({
      in: 1,
      process: pokesSpeaker,
      perception: {
        action: "poked",
        content: "I poked.",
        name: "Samantha",
      },
    });

    const { stream, nextStep } = await initialStep.next(
      externalDialog(
        "Samantha teases the user about they accepted to be poked again"
      ),
      { stream: true }
    );
    speak(stream);

    return nextStep;
  }
};

export default asksToSpeaker;
