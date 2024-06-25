import { createCognitiveStep, WorkingMemory, ChatMessageRoleEnum, indentNicely } from "@opensouls/engine";

export const stripEntityAndVerb = (persona: string, _verb: string, response: string) => {
  // sometimes the LLM will respond with something like "Bogus said with a sinister smile: "I'm going to eat you!" (adding more words)
  // so we just strip any of those
  let strippedResponse = response.replace(new RegExp(`${persona}.*?:`, "i"), "").trim();
  // get rid of the quotes
  strippedResponse = strippedResponse.replace(/^["']|["']$/g, '').trim();
  return strippedResponse
}

export const stripEntityAndVerbFromStream = async (persona: string, stream: AsyncIterable<string>): Promise<AsyncIterable<string>> => {
  const prefix = new RegExp(`^${persona}.*?:\\s*["']*`, "i")
  const suffix = /["']$/

  let isStreaming = !prefix
  let prefixMatched = !prefix
  let buffer = ""
  const isStreamingBuffer: string[] = []

  const processedStream = (async function* () {
    for await (const chunk of stream) {
      // if we are already streaming, then we need to look out for a suffix
      // we keep the last 2 chunks in the buffer to check after the stream is finished
      // otherwise we keep streaming
      if (isStreaming) {
        if (!suffix) {
          yield chunk
          continue;
        }
        isStreamingBuffer.push(chunk)
        if (isStreamingBuffer.length > 2) {
          yield isStreamingBuffer.shift() as string
        }
        continue;
      }

      // if we're not streaming, then keep looking for the prefix, and allow one *more* chunk
      // after detecting a hit on the prefix to come in, in case the prefix has some optional ending
      // characters.
      buffer += chunk;
      if (prefix && prefix.test(buffer)) {
        if (prefixMatched) {
          isStreaming = true;

          buffer = buffer.replace(prefix, '');
          yield buffer; // yield everything after the prefix
          buffer = ''; // clear the buffer
          continue
        }
        prefixMatched = true
      }
    }
    buffer = [buffer, ...isStreamingBuffer].join('')
    // if we ended before switching on streaming, then we haven't stripped the prefix yet.
    if (!isStreaming && prefix) {
      buffer = buffer.replace(prefix, '');
    }
    if (buffer.length > 0) {
      // if there was some buffer left over, then we need to check if there was a suffix
      // and remove that from the last part of the stream.
      if (suffix) {
        buffer = buffer.replace(suffix, '');
        yield buffer; // yield everything before the suffix
        return
      }
      // if there was no suffix, then just yield what's left.
      yield buffer; // yield the last part of the buffer if anything is left
    }
  })();
  return processedStream;
}

const internalDialog = createCognitiveStep((instructions: string | { instructions: string; verb: string; persona: string }) => {
    let instructionString: string, verb: string, persona: string;
    if (typeof instructions === "string") {
      instructionString = instructions;
      verb = "said";
      persona = "Samantha"
    } else {
      instructionString = instructions.instructions;
      verb = instructions.verb;
      persona = instructions.persona;
    }

  return {
    command: ({ soulName: name }: WorkingMemory) => {
      return {
        role: ChatMessageRoleEnum.System,
        name: name,
        content: indentNicely`
            Model the psyche of ${persona}.

            ## Instructions
            * DO NOT include actions (for example, do NOT add non-verbal items like *John Smiles* or *John Nods*, etc).
            * DO NOT include internal thoughts (for example, do NOT respond with John thought: "...").
            * If necessary, use all CAPS to emphasize certain words.

            ${instructionString}

            Please reply with the next utterance from ${persona}. Use the format: '${persona} ${verb}: "..."'
          `
      };
    },
    streamProcessor: (memory: WorkingMemory, stream: AsyncIterable<string>) => stripEntityAndVerbFromStream(persona, stream),
    postProcess: async (memory: WorkingMemory, response: string) => {
      const stripped = stripEntityAndVerb(persona, verb, response);
      const newMemory = {
        role: ChatMessageRoleEnum.Assistant,
        content: `${persona} ${verb}: "${stripped}"`
      };
      return [newMemory, stripped];
    }
  }
})

export default internalDialog
