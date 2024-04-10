import { MentalProcess, WorkingMemory, indentNicely, useActions, useProcessMemory, usePerceptions } from "@opensouls/engine";
import { useBlueprintStore, useOrganizationStore, useProcessManager } from "@opensouls/engine";
import externalDialog from "./lib/externalDialog.js";
import internalMonologue from "./lib/internalMonologue.js";
import emojiEmotion from "./lib/emojiEmotion.js";
import mentalQuery from "./lib/mentalQuery.js";
import useBadFaith, { isBadFaith } from "./mentalProcesses/useBadFaith.js";
import useMultiDialog from "./mentalProcesses/useMultiDialog.js";

const conversationCycle: MentalProcess = async ({ workingMemory }) => {
    const { speak, dispatch, log } = useActions();

    let memory = workingMemory;
    log('conversation cycle');


    log('ending conversation cycle');
    return memory;
}

export default conversationCycle;