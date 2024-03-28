import { ChatMessageRoleEnum, externalDialog, instruction, internalMonologue } from "socialagi";
import { MentalProcess, useActions, usePerceptions } from "soul-engine";
import { Perception } from "soul-engine/soul";
import { prompt } from "./lib/prompt.js";
import { getMetadataFromPerception, newMemory } from "./lib/utils.js";

const initialProcess: MentalProcess = async ({ step: initialStep }) => {
  const { log, dispatch } = useActions();
  const { invokingPerception, pendingPerceptions } = usePerceptions();
  const { userName, discordEvent } = getMetadataFromPerception(invokingPerception);

  const receivedImageFromDiscord = invokingPerception?.action === "sentImage";
  const messageTextContainsUrl = !!invokingPerception?.content?.startsWith("http");
  const containsImage = receivedImageFromDiscord || messageTextContainsUrl;
  if (!containsImage) {
    log("No image perception found. Skipping perception.");
    return initialStep;
  }

  const imageUrl = invokingPerception?.content;
  if (!imageUrl) {
    log("No image URL found in perception. Skipping perception.");
    return initialStep;
  }

  const hasReachedPendingPerceptionsLimit = pendingPerceptions.current.length > 10;
  if (hasReachedPendingPerceptionsLimit) {
    log("Pending perceptions limit reached. Skipping perception.");
    return initialStep;
  }

  const isMessageBurst = hasMoreMessagesFromSameUser(pendingPerceptions.current, userName);
  if (isMessageBurst) {
    log(`Skipping perception from ${userName} because it's part of a message burst`);
    return initialStep;
  }

  log(`Processing image perception from ${userName}`);

  // @ts-expect-error wip
  const visionStep = await initialStep.withUpdatedMemory(() => {
    return [
      {
        role: ChatMessageRoleEnum.User,
        content: [
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
            },
          },
        ],
      },
    ];
  });

  const visionResp = await visionStep.next(instruction(prompt`describe this image`), { model: "vision" });

  log("Image description:", visionResp.value);

  let step = initialStep.withMemory(newMemory("FoodCritic saw this: " + visionResp.value));

  log("thinking about image");
  step = await step.next(
    internalMonologue(
      "FoodCritic thinks about the food he saw in the most positive way possible. If it is not food, he thinks about it as food."
    ),
    {
      model: "quality",
    }
  );

  const { stream, nextStep } = await step.next(
    externalDialog("FoodCritic compliments the food he saw in a very exacerbated way."),
    {
      stream: true,
      model: "quality",
    }
  );

  dispatch({
    action: "says",
    content: stream,
    _metadata: {
      discordEvent,
    },
  });

  return await nextStep;
};

function hasMoreMessagesFromSameUser(pendingPerceptions: Perception[], userName: string) {
  const countOfPendingPerceptionsBySamePerson = pendingPerceptions.filter((perception) => {
    return getMetadataFromPerception(perception)?.userName === userName;
  }).length;

  return countOfPendingPerceptionsBySamePerson > 0;
}

export default initialProcess;
