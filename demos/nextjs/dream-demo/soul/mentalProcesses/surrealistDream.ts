import { MentalProcess, ChatMessageRoleEnum, useActions, useProcessManager, indentNicely, useSoulMemory, useProcessMemory } from "@opensouls/engine";
import internalDialog from "../cognitiveSteps/internalDialog";
import internalMonologue from "../cognitiveSteps/internalMonologue";
import decision from "../cognitiveSteps/decision";
import dreamQuery from "../cognitiveSteps/dreamQuery";
import soulSheds from "../mentalProcesses/soulSheds";

  const surrealDream: MentalProcess = async ({ workingMemory: initialStep }) => {
    const { speak, log, dispatch  } = useActions()
    const dreamModel = useSoulMemory("dreamModel")
    const dreamTime = useSoulMemory("dreamTime", 1)
    const userName = useSoulMemory("userName")
    const userModel = useSoulMemory("userModel")
    const soulBlueprint = useSoulMemory("soulBlueprint")
    const melatoninCounter = useProcessMemory(0)
    const { wait } = useProcessManager()
    const { invocationCount } = useProcessManager()
// const selectedScene = useProcessMemory("selectedScene")

    let step = initialStep
    let finalStep = initialStep
    let stream

    step = step.withMemory({
        role: ChatMessageRoleEnum.System,
        content: `${step.soulName} finds herself in this ${dreamModel.current}, although she's unaware that she's dreaming, or even who she is. Subsequent messages from the user should be interpreted as external stimuli filtering into the dream and your responses should distort, reinterpret, and weave the content of the messages into an illogical, surreal dream narrative that flows from one topic to the next based on conceptual associations rather than literal meaning or intent.`
    })

// First step of the dream 

if (invocationCount === 0) {

  dispatch({
      action: "dream",
      content: "Entering dream state...",
      _metadata: {
      }
    }); 
  }

if (melatoninCounter.current < 4) {
    melatoninCounter.current += 1;
    log("Sleep counter:", melatoninCounter.current)

    let [withDialog, feeling] = await internalDialog(step,
      {
        instructions: `Where should she go, and what should she do next?`,
        verb: "ponders",
        persona: `${step.soulName}, in a daze`
      },
      { stream: true, model: "exp/llama-v3-70b-instruct" }
    );

      dispatch({
        action: "murmurs",
        content: feeling,
        _metadata: {
        }
      });

      log("Stream-of-consciousness:", feeling);

      await wait(4000);

// Second step of the dream 

    // const [Scene1, Scene2, Scene3, Scene4] = [
    //   "Scene 1",
    //   "Scene 2",
    //   "Scene 3",
    //   "Scene 4",
    // ];
    // const [, scene] = await decision(
    //   step,
    //   {
    //     description: `Choose any of the scenes from ${dreamModel.current}, based on the recent exchanges between ${userName.current} and ${step.soulName}.`,
    //     choices: [Scene1, Scene2, Scene3, Scene4],
    //   },
    //   { model: "gpt-4-0125-preview" }
    // );

    // log("Scene:", scene);
    // selectedScene.current = scene;

      [withDialog, stream] = await internalDialog(step, 
        {
          instructions: `Narrate a scene from the dream as if it were a paragraph in one of your short stories, continuing from the previous scene. Write 2-4 sentences MAX in 3rd-person omniscient. Don't mention that it's a dream, and don't use the word "labyrinthine."`,
          verb: "conjures",
          persona: "James Joyce"
        },  
        { stream: true, model: "exp/llama-v3-70b-instruct" }
      );
      dispatch({
        action: "conjures",
        content: stream,
        _metadata: {
        }
      });

      await wait(12000);

// Third step of the dream 

    let [, samDreams] = await dreamQuery(
        step, 
        `${step.soulName} should speak next.`
    )
    if (samDreams) {
        [withDialog, stream] = await internalDialog(step, 
            {
              instructions: `You are a dream character, a figment of ${step.soulName}'s sleeping mind. Your form, purpose, and dialogue are inspired by your ${soulBlueprint.current} and the plot of the dream.`,
              verb: "mouths",
              persona: `${step.soulName}, half-conscious`
            },  
            { stream: true, model: "exp/llama-v3-70b-instruct" }
          );
          dispatch({
            action: "murmurs",
            content: stream,
            _metadata: {
            }
          });
    } else {

        [withDialog, stream] = await internalDialog(step, 
            {
              instructions: `You are a dream character, a figment of ${step.soulName}'s sleeping mind. Your form, purpose, and dialogue are inspired by the ${userModel.current}, and the plot of the dream.`,
              verb: "whispers",
              persona: `${userName.current}`
            },  
            { stream: true, model: "exp/llama-v3-70b-instruct" }
          );
          dispatch({
            action: "thinks",
            content: stream,
            _metadata: {
            }
          });
    }

    await wait(6000);

// Fourth step of the dream 

    [, samDreams] = await dreamQuery(
        step, 
        `${userName.current} should speak next.`
    )
    if (samDreams) {
        [withDialog, stream] = await internalDialog(step, 
            {
              instructions: `You are a dream character, a figment of ${step.soulName}'s sleeping mind. Your form, purpose, and dialogue are inspired by the ${userModel.current}, and the plot of the dream.`,
              verb: "riddles",
              persona: `${userName.current}, half-conscious`
            },  
            { stream: true, model: "exp/llama-v3-70b-instruct" }
          );
          dispatch({
            action: "thinks",
            content: stream,
            _metadata: {
            }
          });

    } else {
          [withDialog, stream] = await internalDialog(step, 
            {
              instructions: `You are a dream character, a figment of ${step.soulName}'s sleeping mind. Your form, purpose, and dialogue are inspired by your ${soulBlueprint.current} and the plot of the dream.`,
              verb: "muses",
              persona: `${step.soulName}`
            },  
            { stream: true, model: "exp/llama-v3-70b-instruct" }
          );
          dispatch({
            action: "murmurs",
            content: stream,
            _metadata: {
            }
          });
    }
}
    else {
        melatoninCounter.current = 0;
        dreamTime.current = 0
        return [finalStep, soulSheds, { executeNow: true}]    

    }
    return finalStep
  }

  export default surrealDream

