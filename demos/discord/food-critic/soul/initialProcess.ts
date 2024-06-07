import { ChatMessageRoleEnum, MentalProcess, Perception, useActions, usePerceptions } from "@opensouls/engine";
import { getMetadataFromPerception } from "./lib/utils.js";
import externalDialog from "./cognitiveSteps/externalDialog.js";
import instruction from "./cognitiveSteps/instruction.js";
import internalMonologue from "./cognitiveSteps/internalMonologue.js";

const initialProcess: MentalProcess = async ({ workingMemory }) => {
  const { log, dispatch } = useActions();
  const { invokingPerception, pendingPerceptions } = usePerceptions();
  const { userName, discordEvent } = getMetadataFromPerception(invokingPerception);

  const receivedImageFromDiscord = invokingPerception?.action === "sentImage";
  const messageTextContainsUrl = !!invokingPerception?.content?.startsWith("http");
  const containsImage = receivedImageFromDiscord || messageTextContainsUrl;
  if (!containsImage) {
    log("No image perception found. Skipping perception.");
    return workingMemory;
  }

  const imageUrl = invokingPerception?.content;
  if (!imageUrl) {
    log("No image URL found in perception. Skipping perception.");
    return workingMemory;
  }

  const hasReachedPendingPerceptionsLimit = pendingPerceptions.current.length > 10;
  if (hasReachedPendingPerceptionsLimit) {
    log("Pending perceptions limit reached. Skipping perception.");
    return workingMemory;
  }

  const isMessageBurst = hasMoreMessagesFromSameUser(pendingPerceptions.current, userName);
  if (isMessageBurst) {
    log(`Skipping perception from ${userName} because it's part of a message burst`);
    return workingMemory;
  }

  log(`Processing image perception from ${userName}`);

  const visionStep = workingMemory.withMemory({
    role: ChatMessageRoleEnum.User,
    content: [
      {
        type: "image_url",
        image_url: {
          url: imageUrl,
        },
      },
    ],
  })

  const [, visionResp] = await instruction(visionStep, "describe this image", { model: "gpt-4-vision-preview" })

  log("Image description:", visionResp);

  workingMemory = workingMemory.withMemory({
    role: ChatMessageRoleEnum.Assistant,
    content: "FoodCritic saw this: " + visionResp,
  });

  [workingMemory] = await internalMonologue(workingMemory,
    "FoodCritic thinks about the food he saw in the most positive way possible. If it is not food, he thinks about it as food."
  );

  let stream;
  [workingMemory, stream] = await externalDialog(workingMemory,
    "FoodCritic compliments the food he saw in a very exacerbated way.",
    {
      stream: true,
      model: "gpt-4-0125-preview",
    }
  );

  dispatch({
    action: "says",
    content: stream,
    _metadata: {
      discordEvent,
    },
  });

  return workingMemory;
}


function hasMoreMessagesFromSameUser(pendingPerceptions: Perception[], userName: string) {
  const countOfPendingPerceptionsBySamePerson = pendingPerceptions.filter((perception) => {
    return getMetadataFromPerception(perception)?.userName === userName;
  }).length;

  return countOfPendingPerceptionsBySamePerson > 0;
}

export default initialProcess;
