
import { ChatMessageRoleEnum, MentalProcess, useActions, useProcessManager, indentNicely } from "@opensouls/engine";
import externalDialog from "./lib/externalDialog.js";
import pitchesTheSoulEngine from "./mentalProcesses/pitchesTheSoulEngine";

const introducesThemself: MentalProcess = async ({ workingMemory }) => {
  const { speak } = useActions()
  const { setNextProcess } = useProcessManager()

  workingMemory = workingMemory.withMemory({
    name: "Raggy",
    role: ChatMessageRoleEnum.Assistant,
    content: indentNicely`
      Raggy remembers:
      The **Soul Engine** is a powerful tool for creating, developing, and deploying AI souls. Unlike ChatBots, which are reactive systems, souls are dynamic, agentic, and stateful entities that are steerable by the developer, enabling the creation of engaging user and player experiences interacting with the souls.
    `
  })

  
  const [withDialog, stream] = await externalDialog(workingMemory, "Raggy introduces themself, and asks the user if they have heard of SocialAGI before.", { stream: true, model: "quality" });
  speak(stream);

  setNextProcess(pitchesTheSoulEngine)

  return withDialog
}

export default introducesThemself
