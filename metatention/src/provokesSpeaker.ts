
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
  const goals = await afterSpeech.next(brainstorm("What are some possible conversational goals Meta could have"))
  log("Brainstormed goals:", goals.value)
  const goal = await goals.compute(decision("Which conversational goal should Meta have", goals.value))
  log("Chose goal:", goal)
  intention.current = await afterSpeech.compute(generateIntention(goal as string))

  return initialStep.withMemory([{role: ChatMessageRoleEnum.Assistant, content: html`
  Meta said: ${afterSpeech.value}
  `}])
}

export default provokesSpeaker
