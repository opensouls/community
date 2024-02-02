
import { ChatMessageRoleEnum, externalDialog } from "socialagi";
import { MentalProcess, useActions, usePerceptions, useSoulMemory } from "soul-engine";

const noticesTheTime: MentalProcess = async ({ step: initialStep }) => {
  const { scheduleEvent, log, speak } = useActions()
  const pendingScheduled = useSoulMemory("pendingScheduled", false)
  const { invokingPerception } = usePerceptions()
  if (!invokingPerception) {
    throw new Error("missing invoking perception, this should not happen")
  }

  let step = initialStep

  log("sinky notices the time")

  const time = new Date(invokingPerception._timestamp)
  // let's take a look at the last message
  const lastUserMessage = step.memories.reverse().find((m) => m.role === ChatMessageRoleEnum.User)
  const timeOfLastUserMessage = new Date((lastUserMessage?.metadata?.timestamp as number | undefined) || 0)

  // if it has been greater than 5 minute since the last message then we'll just give up on talking to the user.
  if (time.getTime() - timeOfLastUserMessage.getTime() > 5 * 60 * 1000) {
    return step.next(externalDialog("Looks like you're not there anymore, I'll let you be"))
  }

  if (time.getTime() - timeOfLastUserMessage.getTime() > 30 * 1000) {
    const { stream, nextStep } = await step.next(externalDialog("Ask the user if you're boring them? Slinky says something interesting about themself."), { stream: true })
    speak(stream)
    step = await nextStep
  }

  scheduleEvent({
    process: noticesTheTime,
    in: 60, // notice the time every 60s,
    perception: {
      name: "Sinky",
      action: "notices",
      content: "the time",
    }
  })
  pendingScheduled.current = true
  
  return step.withMemory([{
    role: ChatMessageRoleEnum.Assistant,
    content: `Sinky notices the time is ${time.toLocaleTimeString()}.`,
  }])
}

export default noticesTheTime
