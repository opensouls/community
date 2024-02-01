import { externalDialog } from "socialagi";
import { MentalProcess, useActions, usePerceptions, useSoulStore, useProcessManager } from "soul-engine";
import asksToSpeaker from "./asksToSpeaker.js";

const pokesSpeaker: MentalProcess = async ({
  step: initialStep
}) => {
  const { speak, scheduleEvent, log } = useActions();
  const { invokingPerception } = usePerceptions();
  const { setNextProcess } = useProcessManager();
  const { get, set } = useSoulStore();

  setNextProcess(asksToSpeaker);
  
  if (get("ignoringPokes")) return initialStep;

  if (invokingPerception?.action === "poked") {
    log("scheduled poke was received");
    set("ignoringPokes", true);
    const { stream, nextStep } = await initialStep.next(
      externalDialog("Ask the user how it felt to be poked?"),
      { stream: true }
    );
    speak(stream);

    return nextStep;
  }

  if (!invokingPerception?.internal) {
    scheduleEvent({
      in: 10,
      process: pokesSpeaker,
      perception: {
        action: "poked",
        content: "I poked.",
        name: "Samantha",
      },
    });
  }

  const { stream, nextStep } = await initialStep.next(
    externalDialog(
      "Samantha tells the user she is gonna poke them in the future, in about 10 seconds."
    ),
    { stream: true }
  );
  speak(stream);

  return nextStep;
};

export default pokesSpeaker;
