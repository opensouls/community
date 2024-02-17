
import { html } from "common-tags";
import { ChatMessageRoleEnum, CortexStep, externalDialog, internalMonologue, mentalQuery } from "socialagi";
import { MentalProcess, useActions, useProcessMemory } from "soul-engine";

const thingNotes = () => () => ({
  command: ({ entityName: name }: CortexStep) => {
    return html`
      Model the mind of ${name}.
      
      ## Description
      Write an updated and clear set of notes on the user that thing that the user wants to name.

      ## Rules
      * Keep descriptions as bullet points
      * Keep relevant bullet points from before
      * Use abbreviated language to keep the notes short
      * Do not write any notes about ${name}

      Please reply with the updated notes on the thing the user wants to name:'
  `},
  process: (_step: CortexStep<any>, response: string) => {
    return {
      value: response,
      memories: [{
        role: ChatMessageRoleEnum.Assistant,
        content: response
      }],
    }
  }
})

const modelsTheThing: MentalProcess = async ({ step: initialStep }) => {
  const thingModel = useProcessMemory("Unkown Thing")
  const { speak, log } = useActions()

  let step = initialStep
  step = step.withMemory([{
    role: ChatMessageRoleEnum.Assistant,
    content: html`
    ${step.entityName} remembers:

    # Thing model

    ${thingModel.current}
  `
  }])
  const modelQuery = await step.compute(mentalQuery(`${step.entityName} has learned something new and they need to update the mental model of the thing.`));
  log("Update model?", modelQuery)
  if (modelQuery) {
    step = await step.next(internalMonologue("What have I learned specifically about the user from the last few messages?", "noted"))
    log("Learnings:", step.value)
    step = await step.next(thingNotes(), { model: "quality" })
    thingModel.current = step.value

    // possibly generate a name
    step = await step.next(internalMonologue("Generate a 1 potentially fitting name and explain why", "brainstorms"), { model: "quality" })
    const name = step.value
    log("Considering the name", name)
    step = await step.next(internalMonologue(html`
      Rate the name on a scale of 1-10, 10 being the best possible name
    `, "rated"))
    const rating = step.value
    const share = await step.compute(mentalQuery("The name is a 8 or higher"))
    log("Good enough to share?", share, rating)
    if (share) {
      const { stream, nextStep } = await initialStep.next(externalDialog(html`
        ${step.entityName} just thought of the name ${name}
        Offer this name as a suggestion
        Explain why the suggestion is interesting
      `, "suggested"), { stream: true, model: "quality" })
      speak(stream)
      return nextStep
    } else {
      const thought = await step.next(internalMonologue(html`
        Think about the essence of the name
      `, "mused"), { model: "quality" })
      return initialStep.withMemory([{
        role: ChatMessageRoleEnum.Assistant,
        content: `${step.entityName} mused: ${thought.value}`
      }])
    }
  }

  return initialStep
}

export default modelsTheThing