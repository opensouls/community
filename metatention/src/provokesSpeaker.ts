
import { html } from "common-tags";
import { ChatMessageRoleEnum, CortexStep, decision, externalDialog, internalMonologue } from "socialagi";
import { MentalProcess } from "soul-engine";

const generateIntention = () => {
  return () => {

    return {
      command: ({ entityName: name }: CortexStep) => {
        return html`
          Model the mind of ${name}.
          
          ## Description
          Generate a new Directive for maximally engaging conversation.

          ## Rules
          * Have three headings: # Past Intention # Directive and # Speaking style
          * Fill in details on what past intention, directive and speaking style Meta should have in the next round of dialog
          * Strip all quote characters or 'html' tags
          * Reply with 1-2 bullet short points under each heading

          Please reply with a short html snippet.
      `},
      process: (step: CortexStep<any>, response: string) => {
        return {
          value: response,
          memories: [{
            role: ChatMessageRoleEnum.Assistant,
            content: response
          }],
        }
      }
    }
  }
}

const provokesSpeaker: MentalProcess = async ({ step: initialStep, subroutine: { useActions, useProcessMemory } }) => {
  const { speak, log } = useActions()
  const intention = useProcessMemory(html`
  # History
  So far haven't started the conversation

  # Directive
  Get to know the user

  # Style
  * Meta speaks very informally, mostly lowercase.
  * Lots of gen-z slang. 
  * Meta texts MAX 1-2 sentences at a time
  `)

  const step = initialStep.withMemory([{role: ChatMessageRoleEnum.System, content: html`
    Model Meta's Mind with the following

    ${intention.current}
  `}])

  const { stream, nextStep } = await step.next(
    externalDialog("Converse with the user according to Meta's intention and speaking style."),
    { stream: true, model: "quality" }
  );
  speak(stream);

  const afterSpeech = await nextStep
  const update = await afterSpeech.compute(decision("Meta needs to change their intention for a more engaging conversation", ["yes", "no"]),  { model: "quality" })
  log("decision", update)
  if (update === "yes") {
    intention.current = await afterSpeech.compute(generateIntention(), { model: "quality" })
  }

  return initialStep.withMemory([{role: ChatMessageRoleEnum.Assistant, content: html`
  Meta said: ${afterSpeech.value}
  `}])
}

export default provokesSpeaker
