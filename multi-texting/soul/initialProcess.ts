
import { html } from "common-tags";
import { externalDialog, decision } from "socialagi";
import { MentalProcess, useActions, useProcessMemory, usePerceptions, useProcessManager } from "soul-engine";

const multiTexts: MentalProcess = async ({ step: initialStep }) => {
  const { speak, scheduleEvent, log } = useActions()
  const fragmentNo = useProcessMemory(0)
  const { wait } = useProcessManager()
  const { pendingPerceptions } = usePerceptions()

  let step = await initialStep.next(
    externalDialog("Texty sends a sentence fragment, part of a larger or greater thought to come"),
    { model: "quality" }
  );
  if (pendingPerceptions.current.length > 0) {
    return initialStep
  }
  speak(step.value);

  let count = parseInt(await step.compute(
    decision(html`
      How many additional sentence fragments will Texty want to text next.
      Make sure to mix up the number of fragments so it feels natural.
      Last batch of texts was ${fragmentNo.current} additional fragments long.
      Most responses should be 0. Sometimes 1 or maybe 2-5 fragments long.
    `, ['5', '4', '3', '2', '1', '0']),
    { model: "quality" }
  ) as string) as number
  fragmentNo.current = count

  if (count === 0) {
    return step
  }

  while (count > 1) {
    wait(1000)
    let length = await step.compute(
      decision(html`
        How long should the next fragment be?
      `, ['very long', 'long', 'medium', 'short']),
      { model: "quality" }
    ) as number
    count -= 1
    const preStep = step
    step = await step.next(
      externalDialog(html`
        - Texty sends a sentence fragment, extending the train of thought from their last text
        - Make sure the fragment is ${length} in length
        - Their last text was: "${step.value}"
      `),
      { model: "quality" }
    );
    if (pendingPerceptions.current.length > 0) {
      return preStep
    }
    speak(step.value);

  }

  const text = await step.compute(
    decision(html`
      Does Texty need to add another thought to finish their last text fragment?
    `, ["yes", "no"]),
    { model: "quality" }
  )
  if (text === "yes") {
    const preStep = step
    step = await step.next(
      externalDialog(html`
        - Texty needs to finish their last sentence fragment in this message
      `),
      { model: "quality" }
    );
    if (pendingPerceptions.current.length > 0) {
      return preStep
    }
    speak(step.value);
  }

  return step
}

export default multiTexts
