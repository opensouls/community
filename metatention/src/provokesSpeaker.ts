
import { html } from "common-tags";
import { ChatMessageRoleEnum, CortexStep, brainstorm, decision, externalDialog, internalMonologue } from "socialagi";
import { MentalProcess } from "soul-engine";

const generateIntention = (goal: string) => {
  return () => {

    return {
      command: ({ entityName: name }: CortexStep) => {
        return html`
          Model the mind of ${name}.
          
          ## Description
          Generate a new Directive for ${goal}.

          ## Rules
          * Have three headings:
            # Past Intention
            [[fill in]]
            
            # Directive
            [[fill in]]
            
            # Speaking style
            [[fill in]]
          * Fill in details on what past intention, directive and speaking style Meta should have in the next round of dialog
          * Strip all quote characters
          * Strip all \`\`\`
          * Strip all markdown labels
          * Reply with 1-2 bullet short points under each heading

          Please reply the updated markdown snippet.
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

const provokesSpeaker: MentalProcess = async ({ step: initialStep, subroutine: { useActions, useProcessMemory, useProcessManager } }) => {
  const { speak, log } = useActions()
  const { invocationCount } = useProcessManager()
  const intention = useProcessMemory("")


  if (invocationCount === 0) {
    const goals = await initialStep.next(brainstorm("What are some possible ideas for conversational goals Meta wants"))
    log("Brainstormed goals:", goals.value)
    const goal = await goals.compute(decision("Which conversational goal does Meta want next", goals.value))
    log("Chose goal:", goal)
    intention.current = await initialStep.compute(generateIntention(goal as string))
  }

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
  const goals = await afterSpeech.next(brainstorm("What are some possible ideas for conversational goals Meta wants next? Can include its current goal"))
  log("Brainstormed goals:", goals.value)
  const goal = await goals.compute(decision("Which conversational goal does Meta want next (or keep doing)", goals.value))
  log("Chose goal:", goal)
  intention.current = await afterSpeech.compute(generateIntention(goal as string))

  return initialStep.withMemory([{role: ChatMessageRoleEnum.Assistant, content: html`
  Meta said: ${afterSpeech.value}
  `}])
}

export default provokesSpeaker
