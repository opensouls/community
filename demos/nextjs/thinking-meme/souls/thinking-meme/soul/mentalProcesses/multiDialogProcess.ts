import { MentalProcess, useActions, useProcessMemory, usePerceptions, useProcessManager, indentNicely } from "@opensouls/engine";
import externalDialog from "../lib/externalDialog.js";
import decision from "../lib/decision.js"
import initialProcess from "../initialProcess.js";

const multiDialogProcess: MentalProcess = async ({ workingMemory }) => {

  const { speak, log } = useActions()
  const { wait } = useProcessManager()
  const fragmentNo = useProcessMemory(0)
  const { pendingPerceptions } = usePerceptions();
  const debug = false; 
  let thought
  let memory = workingMemory;

  if(debug) log("multi dialog")

  if (pendingPerceptions.current.length > 0) {
    if(debug) log("ignoring due to pending");
    return memory;
  }

  [memory, thought] = await externalDialog(memory,
    "Speaks a sentence fragment, part of a larger or greater thought to come",
    { model: "gpt-4-0125-preview" })
  speak(thought);

  const [, countString] = await decision(memory, {
    description: `Pick a random number, you picked ${fragmentNo.current} last time.`,
    choices: ['5', '4', '3', '2', '1', '0'],
  }, { model: "gpt-3.5-turbo-0125" });
  let count = parseInt(countString);

  fragmentNo.current = count;
  if(debug) log('sending', fragmentNo.current, 'messages');

  while (count > 1) {
    count -= 1;
    if(debug) log('message', count)
    await wait(200)

    const [, lengthOfText] = await decision(workingMemory, {
      description: "Pick a random length.",
      choices: ['very long', 'long', 'medium', 'short'],
    }, { model: "gpt-3.5-turbo-0125" })

    const preStep = memory;
    const lastThought = memory.slice(-1).memories[0].content;
    if(debug) log('last thought', lastThought);
    let nextText
    [memory, nextText] = await externalDialog(
      memory,
      indentNicely`
        - Says a sentence fragment, extending the train of thought from the last thing they said
        - Make sure the fragment is ${lengthOfText} in length
        - Their last text was: "${lastThought}"
      `,
      { model: "gpt-4-0125-preview" }
    );

    if (pendingPerceptions.current.length > 0) {
      if(debug) log('exited early due to pending perceptions')
      return preStep;
    }

    speak(nextText);
  }

  const [, shouldText] = await decision(memory, {
    description: "Should one more thing be said to finish their last text fragment?",
    choices: ["yes", "no"],
  }, { model: "gpt-3.5-turbo-0125" })

  if (shouldText === "yes") {
    let speech;
    const preStep = memory;
    if(debug) log('one last thought');
    [memory, speech] = await externalDialog(
      memory,
      indentNicely`
        - Says one more thing to finish their last sentence fragment
      `,
      { model: "gpt-4-0125-preview" }
    );


    //TODO some sort of postprocess after cognitive steps finish to evalute if we should continue
    if (pendingPerceptions.current.length > 0) {
      if(debug) log('exited early due to pending perceptions')
      return preStep
    }

    speak(speech);
  }

  if(debug) log("done with multi dialog")
  return [memory, initialProcess]
}

export default multiDialogProcess
