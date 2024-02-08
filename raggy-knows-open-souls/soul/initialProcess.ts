
import { html } from "common-tags";
import { ChatMessageRoleEnum, externalDialog } from "socialagi";
import { MentalProcess, useActions, useProcessManager } from "soul-engine";
import pitchesTheSoulEngine from "./mentalProcesses/pitchesTheSoulEngine";

const introducesThemself: MentalProcess = async ({ step: initialStep }) => {
  const { speak } = useActions()
  const { setNextProcess } = useProcessManager()

  let step = initialStep

  step = step.withMemory([{
    role: ChatMessageRoleEnum.Assistant,
    content: html`
      Raggy remembers:
      The **Soul Engine** is a powerful tool for creating, developing, and deploying AI souls. Unlike ChatBots, which are reactive systems, souls are dynamic, agentic, and stateful entities that are steerable by the developer, enabling the creation of engaging user and player experiences interacting with the souls.
    `
  }])

  const { stream, nextStep } = await step.next(
    externalDialog("Raggy introduces themself, and asks the user if they have heard of SocialAGI before."),
    { stream: true, model: "quality" }
  );
  speak(stream);

  setNextProcess(pitchesTheSoulEngine)

  return nextStep
}

export default introducesThemself





