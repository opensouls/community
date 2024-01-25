
import { externalDialog } from "socialagi";
import { MentalProcess } from "soul-engine";

const pokesSpeaker: MentalProcess = async ({ step: initialStep, subroutine: { useActions, usePerceptions } }) => {
  const { speak, scheduleEvent, log } = useActions()
  const { invokingPerception } = usePerceptions()

  if (invokingPerception?.action === "poked") {
    log("scheduled poke was received")
    const { stream, nextStep } = await initialStep.next(
      externalDialog("Ask the user how it felt to be poked?"),
      { stream: true }
    );
    speak(stream);
  
    return nextStep
  }

  if (!invokingPerception?.internal) {
    scheduleEvent({
      in: 10,
      process: pokesSpeaker,
      perception: {
        action: "poked",
        content: "I poked.",
        name: "Samantha",
      }
    })
  }

  const { stream, nextStep } = await initialStep.next(
    externalDialog("Samantha tells the user she is gonna poke them in the future, in about 10 seconds."),
    { stream: true }
  );
  speak(stream);

  return nextStep
}

export default pokesSpeaker
