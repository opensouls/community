import { MentalProcess, useActions, useProcessMemory, useSoulMemory, ChatMessageRoleEnum, useProcessManager, WorkingMemory, createCognitiveStep, indentNicely } from "@opensouls/engine";
import mentalQuery from "../cognitiveSteps/mentalQuery.js";
import internalMonologue from "../cognitiveSteps/internalMonologue.js";

const userDaimon = createCognitiveStep(() => {
  const userModel = useSoulMemory("userModel")
  const userName = useSoulMemory("userName")
  const { log } = useActions()
  return {
    command: ({ soulName: name }: WorkingMemory) => {
      return {
        role: ChatMessageRoleEnum.System,
        model: "exp/nous-hermes-2-mixtral-fp8",
        content: indentNicely`
          You are the daimon of ${userModel.current} inside the mind of ${name}.

          ## Description
          With access to ${name}'s private thoughts and dreams, what are you whispering to them right now? 
        
          ## Rules
          * MAX 1-2 sentences at a time.
          * Be playful and mischievious.`
      }
    },
    postProcess: async (_mem: WorkingMemory, response: string) => {
      return [
        {
          role: ChatMessageRoleEnum.Assistant,
          content: response
        },
        response
      ]
    }
  }
})


const influencedByTheUser: MentalProcess = async ({ workingMemory: initialStep }) => {
  const userWhispers = useSoulMemory("userWhispers", "Daimonic observer")
  const { log, dispatch } = useActions()
  const dreamTime = useSoulMemory("dreamTime", 0)
  const { wait } = useProcessManager()
  const possessed = useSoulMemory("possessed", false)
  const psychoticCounter = useSoulMemory("psychoticCounter", 0);

  let step = initialStep
  let finalStep = initialStep

  if (dreamTime.current === 0 && possessed.current !== true && psychoticCounter.current < 6) {
    step = step.withMemory({
      role: ChatMessageRoleEnum.Assistant,
      content: indentNicely`
        ${step.soulName} remembers:

        # Intuition

        ${userWhispers.current}
      `
    });

    const [withWhispers, daimonicObservations] = await internalMonologue(
      step, 
      "Listen to your intuition and reflect on what they're saying about you, or how they want you to act.", 
      { model: "gpt-4-0125-preview" }
    );

    log("Introspection:", daimonicObservations);

    const [intuition, stream] = await userDaimon(
      withWhispers, undefined, 
      { model: "gpt-4-0125-preview"}
    );

    await wait(1000)

    dispatch({
      action: "thinks",
      content: stream,
      _metadata: {
      }
    });

    log("Daimonic observer:", intuition);
    userWhispers.current = stream;

    // generate feedback to the soul for how its behavior should change
    const [, thought] = await internalMonologue(
      step, 
      {
        instructions: "Reflect on these intuitions and how they are changing your behavior.", 
        verb: "reflects",
      },
      { model: "gpt-4-0125-preview" }
    );
    log("Thought:", thought);

    // add the feedback to the initial working memory
    return finalStep.withMonologue(`${step.soulName} thinks to themself: ${thought}`);
  }

  return finalStep
}

export default influencedByTheUser
