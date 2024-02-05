
import { externalDialog } from "socialagi";
import { MentalProcess, useActions, usePerceptions } from "soul-engine";
import { chats } from "./lib/chats.js";

const chatsWithTheChannel: MentalProcess = async ({ step: initialStep }) => {
  const { dispatch } = useActions()

  const { stream, nextStep } = await initialStep.next(
    externalDialog("respond to the discord", "chatted"),
    { stream: true }
  );

  dispatch(chats(stream));

  return nextStep
}

export default chatsWithTheChannel
