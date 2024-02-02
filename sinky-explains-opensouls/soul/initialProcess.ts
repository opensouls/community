
import { externalDialog } from "socialagi";
import { MentalProcess, useActions, useProcessManager, useSoulMemory } from "soul-engine";
import findsOutAboutTheUser from "./mentalProcesses/findOutAboutTheUser.js";
import noticesTheTime from "./mentalProcesses/noticesTheTime.js";

const sagtHallo: MentalProcess = async ({ step: initialStep }) => {
  const { speak, scheduleEvent } = useActions()
  const { setNextProcess } = useProcessManager()
  const pendingScheduled = useSoulMemory("pendingScheduled", false)

  scheduleEvent({
    process: noticesTheTime,
    in: 30, // notice the time every 60s,
    perception: {
      name: "Sinky",
      action: "notice",
      content: "the time",
    }
  })
  pendingScheduled.current = true

  const { stream, nextStep } = await initialStep.next(
    externalDialog("Introduce yourself to the user. Welcome them graciously!"),
    { stream: true }
  );
  speak(stream);

  setNextProcess(findsOutAboutTheUser)

  return nextStep
}

export default sagtHallo
