import { MentalProcess, useActions, useSoulMemory } from "@opensouls/engine";
import externalDialog from "./cognitiveSteps/externalDialog.js";
import reengage from "./mentalProcesses/reengage.js";

const initialProcess: MentalProcess = async ({ workingMemory }) => {
  const { speak, log } = useActions();
  const nextReengagementAt = useSoulMemory<string | null>("nextReengagementAt");

  const [withDialog, stream] = await externalDialog(
    workingMemory,
    "Talk to the user trying to gain trust and learn about their inner world.",
    { stream: true, model: "quality" }
  );
  speak(stream);

  if (nextReengagementAt.current === null) {
    nextReengagementAt.current = scheduleReengagement();
    log("Next reengagement at", nextReengagementAt.current);
  }

  return withDialog;
};

function scheduleReengagement() {
  const { scheduleEvent } = useActions();

  const nextReengagementTime = getNextReengagementTime();

  scheduleEvent({
    when: nextReengagementTime,
    perception: { action: "reengage", content: "" },
    process: reengage,
  });

  return nextReengagementTime.toISOString();
}

function getNextReengagementTime() {
  const startUtcHour = 12;
  const endUtcHour = 23;

  const result = new Date();
  const currentHourUtc = new Date().getUTCHours();

  let randomHour = Math.floor(Math.random() * (endUtcHour - startUtcHour + 1)) + startUtcHour;

  const isNextDay = randomHour <= currentHourUtc;
  if (isNextDay) {
    result.setUTCDate(result.getUTCDate() + 1);
    randomHour %= 24;
  }

  result.setUTCHours(randomHour, 0, 0, 0);

  return result;
}

export default initialProcess;
