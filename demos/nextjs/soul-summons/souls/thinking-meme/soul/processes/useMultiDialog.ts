import { MentalProcess, useActions, useProcessMemory, usePerceptions, useProcessManager, indentNicely } from "@opensouls/engine";
import externalDialog from "../lib/externalDialog.js";
import decision from "../lib/decision.js"
import initialProcess from "../initialProcess.js";

const useMultiDialog: MentalProcess = async ({ workingMemory }) => {
  const { speak, log } = useActions()
  const fragmentNo = useProcessMemory(0)
  const { wait } = useProcessManager()
  const { pendingPerceptions } = usePerceptions();

  log("done with multi dialog")

  let thought
  let memory = workingMemory;

  [memory, thought] = await externalDialog(memory,
    "Speaks a sentence fragment, part of a larger or greater thought to come",
    { model: "quality" })

  if (pendingPerceptions.current.length > 0) {
    return memory
  }

  speak(thought);

  let count = Math.round(Math.random() * 4)
  fragmentNo.current = count

  if (count === 0) {
    return memory
  }

  while (count > 1) {

    await wait(200)

    let count = Math.round(Math.random() * 3)
    const choices = ['very long', 'long', 'medium', 'short'];
    const preStep = memory;

    let nextText
    [memory, nextText] = await externalDialog(
      memory,
      indentNicely`
        - Says a sentence fragment, extending the train of thought from their last text
        - Make sure the fragment is ${choices[count]} in length
        - Their last text was: "${memory.slice(-1).memories[0].content}"
      `,
      { model: "quality" }
    );

    if (pendingPerceptions.current.length > 0) {
      return preStep;
    }

    speak(nextText);
  }

  const [, shouldText] = await decision(memory, {
    description: "Should one more thing be said to finish their last text fragment?",
    choices: ["yes", "no"],
  }, { model: "quality" })

  if (shouldText === "yes") {
    let speech;
    const preStep = memory;
    [memory, speech] = await externalDialog(
      memory,
      indentNicely`
        - Says one more thing to finish their last sentence fragment
      `,
      { model: "quality" }
    );
    if (pendingPerceptions.current.length > 0) {
      return preStep
    }
    speak(speech);
  }

  log("done with multi dialog")
  return [memory, initialProcess, { executeNow: true }]
}

export default useMultiDialog
