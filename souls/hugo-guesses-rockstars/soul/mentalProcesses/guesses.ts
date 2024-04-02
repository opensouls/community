import { indentNicely } from "@opensouls/engine";
import externalDialog from "../lib/externalDialog.js";
import mentalQuery from "../lib/mentalQuery.js";
import { MentalProcess, useProcessMemory, useActions } from "@opensouls/engine";
import brainstorm from "../lib/brainstorm.js";

const guesses: MentalProcess<{ object: string }> = async ({
  workingMemory,
}) => {
  const questionsAttempted = useProcessMemory(0);
  const { speak, log } = useActions();

  log("questions attempted: ", questionsAttempted.current);

  const [withQuery, didRight] = await mentalQuery(
    workingMemory,
    "Hugo won the game because he guessed the correct musician and his guess was explicitly confirmed by the user."
  );

  if (didRight) {
    log("user did right");
    const [nextMemory, stream] = await externalDialog(withQuery, "Hugo celebrates.", { stream: true });
    speak(stream);
    // commenting out the leaveConversation for now will keep the conversation going
    // log("leaving conversation");
    // leaveConversation();
    return nextMemory;
  }

  questionsAttempted.current += 1;

  const [withConfidenceQuery, isConfident] = await mentalQuery(
    withQuery,
    "Hugo is confident he knows who the musician is and does not need a hint."
  );

  if (isConfident) {
    const [nextMemory, stream] = await externalDialog(withConfidenceQuery, "Hugo guesses a musician by name.", { stream: true });
    speak(stream);
    return nextMemory;
  }

  const [,hintIdeas] = await brainstorm(
    withConfidenceQuery,
    "Hugo thinks of yes or no questions that would help him figure out the rockstar."
  );
  const [nextMemory, stream] = await externalDialog(withConfidenceQuery, indentNicely`
    Hugo asks for a single hint from the following ideas:
    ${hintIdeas.map((idea) => `* ${idea}`).join("\n")}
  `, { stream: true });
  speak(stream);
  return nextMemory;
};

export default guesses;
