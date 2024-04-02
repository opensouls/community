import { MentalProcess, useActions } from "@opensouls/engine";
import externalDialog from "../lib/externalDialog.js";
import mentalQuery from "../lib/mentalQuery.js";

const frustration: MentalProcess = async ({ workingMemory }) => {
  const { speak } = useActions();
  const [withQuery, frustrated] = await mentalQuery(
    workingMemory,
    "Hugo tried to guess the musician failed more than 2 or 3 times."
  );

  if (frustrated) {
    const [withMonologue, stream] = await externalDialog(
      withQuery,
      "Hugo is stumped! He should compliment the conversation partner on being smart and knowing a lot about musicians."
    );
    speak(stream);
    return withMonologue;
  }

  return workingMemory;
};

export default frustration;
