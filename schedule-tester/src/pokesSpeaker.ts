
import { externalDialog } from "socialagi";
import { MentalProcess } from "soul-engine";

const pokesSpeaker: MentalProcess = async ({ step: initialStep, subroutine: { useActions } }) => {
  const { speak, schedulePerception } = useActions()

  schedulePerception({
    when: new Date(Date.now() + 10_000),
    process: pokesSpeaker,
    perception: {
      action: "said",
      content: "I said this on a schedule, mfer",
      name: "Samantha",
    }
  })


  const { stream, nextStep } = await initialStep.next(
    externalDialog("Tell the user you are about to poke them on a schedule."),
    { stream: true }
  );
  speak(stream);

  return nextStep
}

export default pokesSpeaker
