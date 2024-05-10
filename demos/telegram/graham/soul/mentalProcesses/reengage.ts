import { MentalProcess, useActions, useSoulMemory } from "@opensouls/engine";
import externalDialog from "../cognitiveSteps/externalDialog.js";

const reengage: MentalProcess = async ({ workingMemory }) => {
  const { speak } = useActions();
  const nextReengagementAt = useSoulMemory<string | null>("nextReengagementAt");

  nextReengagementAt.current = null;

  const [withReengagement, stream] = await externalDialog(
    workingMemory,
    "Tell the user a dad joke or share an obscure fact to restart the conversation.",
    { stream: true, model: "quality" }
  );
  speak(stream);

  return withReengagement;
};

export default reengage;
