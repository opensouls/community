import { html } from "common-tags";
import { externalDialog, internalMonologue, decision } from "socialagi";
import { MentalProcess, useActions, useProcessMemory } from "soul-engine";

/*
A decision-making process to dynamically choose between asking thought-provoking questions or sharing interesting facts,
with the aim of effectively moving the naming conversation forward without ever suggesting a name directly.
*/
const brainstorms: MentalProcess = async ({ step: initialStep }) => {
  const { speak, log  } = useActions()
  const questionCounter = useProcessMemory(0)
  const factCounter = useProcessMemory(0)

  const choice = await initialStep.compute(
    decision("Will an interesting fact or asking a question better move the naming conversation along?", ["question", "fact"])
  )
  log("choice", choice)

  if ((choice === "question" && questionCounter.current < 3) || factCounter.current > 3) {
    questionCounter.current += 1
    factCounter.current = 0
    let step = await initialStep.next(
      internalMonologue("Explain what Alfred needs to know about the essence of thing the user wants to name"),
    );
    step = await step.next(
      internalMonologue("Explain what Alfred needs to know more about to be able to name this thing effectively")
    );
  
    const { stream, nextStep } = await step.next(
      externalDialog(html`
      Ask the user a thought provoking question.
      Make a statement that helps move the naming conversation forwards.
      Express emotion, and reactions strongly.
      Connect the question to previous discussion or statements.
      Get offended if the user isn't liking your questions or names
      DO NOT EVER SUGGEST A NAME
      `), 
      { stream: true, model: "quality" }
    );
    speak(stream);
  
    step = await nextStep
  
    step = await step.next(
      internalMonologue("Have an interesting thought about the current naming conversation")
    );
    return step
  } else {
    questionCounter.current = 0
    factCounter.current += 1
    let step = await initialStep.next(
      internalMonologue(html`
        Consider an interesting fact to share about the present naming conversation
      `),
    );
    const { stream, nextStep } = await step.next(
      externalDialog(html`
      Go on a tangent related to what the user is saying
      Do NOT ask a question
      Share an interesting thought about the present naming conversation
      Express disagreement
      Add in a strong emotional reaction sometimes
      Consider getting offended
      DO NOT EVER SUGGEST A NAME
      DO NOT BE A SYCHOPHANT
      `), 
      { stream: true, model: "quality" }
    );
    speak(stream);
  
    step = await nextStep
    return step
  }
}

export default brainstorms