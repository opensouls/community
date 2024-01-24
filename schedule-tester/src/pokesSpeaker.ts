
import { externalDialog } from "socialagi";
import { MentalProcess } from "soul-engine";

const pokesSpeaker: MentalProcess = async ({ step: initialStep, subroutine: { useActions, usePerceptions } }) => {
  const { speak, scheduleEvent } = useActions()
  const { invokingPerception } = usePerceptions()

  if (!invokingPerception?.internal) {
    console.log("still broke mf")
    scheduleEvent({
      in: 10,
      process: pokesSpeaker,
      perception: {
        action: "said",
        content: "I said this on a schedule, mfer",
        name: "Samantha",
        internal: true,
      }
    })
  }

  const { stream, nextStep } = await initialStep.next(
    externalDialog("Tell the user you are about to poke them on a schedule."),
    { stream: true }
  );
  speak(stream);

  return nextStep
}

export default pokesSpeaker
