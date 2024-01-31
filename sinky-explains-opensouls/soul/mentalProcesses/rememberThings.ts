
import { html } from "common-tags";
import { externalDialog, mentalQuery, z } from "socialagi";
import { MentalProcess, useActions, useProcessManager, useSoulMemory, useSoulStore } from "soul-engine";

const rememberExtraction = () => {
  return () => {

    const params = z.object({
      key: z.string().describe(`The database key to store what the user asked.`),
      value: z.string().describe(`The value the user asked Sinky to remember.`)
    })

    return {
      description: html`
        This function extracts what a user has recently asked Sinky to remember, and puts it into key/value terms, so 
        that it can be stored in a database.
      `,
      name: "rememberExtraction",
      parameters: params
    };
  }
}

const rememberThings: MentalProcess = async ({ step: initialStep }) => {
  const { speak, log  } = useActions()
  const { invocationCount } = useProcessManager()
  const didRemember = useSoulMemory("didRemember", -1)
  const { set, get } = useSoulStore()

  didRemember.current = invocationCount
  log("didRemember", didRemember.current, "invocationCount: ", invocationCount)

  let step = initialStep

  const didAskToRemember= await step.compute(mentalQuery("The user asked Sinky to remember something and Sinky hasn't yet."))
  if (didAskToRemember) {
    const { key, value } = await step.compute(rememberExtraction())
    log("setting", key, "to", value)
    set(key, value)
    const { stream, nextStep } = await step.next(externalDialog(`Tell the user that Slinky will definitely remember that ${key} = ${value}`), { stream: true, model: "quality" })
    speak(stream)
    step = await nextStep
  } else {
    const { stream, nextStep } = await step.next(externalDialog("Respond directly to the user's questions."), { stream: true, model: "quality" })
    speak(stream)
    step = await nextStep
  }

  return step
}

export default rememberThings
