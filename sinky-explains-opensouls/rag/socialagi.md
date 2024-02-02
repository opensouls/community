# SocialAGI
SocialAGI is a typescript library to simulate human cognition for AI souls. It works using a `CortexStep` with memories and calling `next()` with a `CognitiveFunction`. The call to `next` then returns a new `CortexStep` with a `value`, and new memories.

The two methods of a CortexStep that concern you are `withMemory` and `next`. Additionally, you will write `storyBeat` functions.

## Example

```typescript
// withMemory is additive, it *adds* these new memories to the CortexStep, it does not replace
// what's already there.
const step = new CortexStep("Courtney").withMemory([
  {
    role: ChatMessageRoleEnum.System,
    content: "You are modeling the mind of Courtney"
  }
])

// a *new* step is returned, leaving the original step unchanged
const step2 = step.next(externalDialog("Courtney should respond in a sad, and reserved tone."))
/**
step2.value might equal "I'm... I'm... so... sad to hear that."
step2.memories would now look like:
[
  {
    role: ChatMessageRoleEnum.System,
    content: "You are modeling the mind of Courtney"
  },
  {
    role: ChatMessageRoleEnum.Assistant,
    content: "Courtney said: I'm... I'm... so... sad to hear that."
  }
]
*/
```

## Interfaces

The memory of a CortexStep is an array of `ChatMessage` objects. No other keys except `role`, and `content` are allowed.

```typescript
enum ChatMessageRoleEnum {
  System = "system",
  User = "user",
  Assistant = "assistant",
}

interface ChatMessage {
  role: ChatMessageRoleEnum;
  content: string;
}
```

## Cognitive Functions

`CognitiveFunction`s are used as the argument to the `next()` method of a `CortexStep`. They guide the AI's cognition process. Here's a brief explanation of each CognitiveFunction:

* `externalDialog(extraInstructions?: string, verb = "said")`: Creates dialog spoken by the AI character. The `extraInstructions` parameter provides guidance on the content of the dialog. The verb describes the kind of speech (said, yelled, whispered, etc). extraInstructions are not word-for-word what the AI soul says, but instead instructs them on the content of their speech (and are short and terse). The value of a CortexStep after externalDialog is a `string`.
* `internalMonologue(extraInstructions?: string, verb = "thought")`: Generates internal thoughts for the AI character. The extraInstructions parameter provides direction on the content of the thoughts. The verb describes the kind of thought process (thought, worried, considered, etc). extraInstructions are not word-for-word what the AI soul thinks, but instead guide them on the content of their thoughts (and are short and terse). The value of a CortexStep after internalMonologue is a `string`.
* `decision(description: string, choices: EnumLike | string[])`: Used to pick from a set of choices. The `description` parameter describes the decision to be made and the `choices` parameter provides the set of choices to pick from. This function is more of an extraction and an internalMonologue should be used before a decision. The value of a CortexStep after decision is one element of the array of choices passed to the decision function.
* `brainstorm(description: string)`: Used to generate new ideas. The `description` parameter describes the the ideas to brainstorm. The value of a CortexStep after brainstorm is a `string[]`.
