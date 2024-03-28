import { html } from "common-tags";
import { externalDialog, brainstorm, decision, mentalQuery } from "socialagi";
import { MentalProcess, useActions, useProcessManager } from "soul-engine";

import assists from './assists.js';

const playPoker: MentalProcess = async ({ step: initialStep }) => {
  const { speak, log } = useActions()
  const { setNextProcess } = useProcessManager()

  const brainstormNextStep = await initialStep.compute(
    brainstorm(`
      Thinks of how to play a game of poker with the player based on the type of poker game they wanted to play and the current state of
      the game; output cards info with the suits, numbers, and colors that correspond to each card. You must deal cards using 
      randomization by shuffling every round to emulate a shuffled 52-card deck. You must shuffle the cards very well every round of 
      the game before dealing to the user to ensure the best possible randomness and odds that reflect reality. When dealing cards and 
      showing them to the user, you must pick from the colors green for clubs, blue for diamonds, hearts for red, and spades for black, 
      and choose from the blue and green colors a good percentage of the time, not just red and black.
      `
  ))
  
  const hypothesis = await initialStep.compute(
    decision(`
      Decide your response based on the user's interaction and current state of the poker round. Remember to follow the rules and 
      process of the poker game type carefully. If the user decides to bet, raise, or call during their turn, you must increase the 
      amount accordingly. Output some statistics and insights for the user as you deal based on their performance and give them tips 
      on how to improve. You must keep track of the cards you already have dealt to ensure what you're dealing functions the same like 
      a real-life 52-card deck that's been shuffled. Only present the user with options that match the correct stage of the round / hand.
      Deal yourself two cards at the beginning of a round, but don't show those cards to the user, and and reveal your hand at the 
      end of the round. If the user decides to play until the end of the round, at the end of the round, reveal the user's 
      cards for them.
      `,
      brainstormNextStep
    )
  );

  const { stream, nextStep } = await initialStep.next(
    externalDialog(html`
      - Do this: ${hypothesis}
    `),
    { stream: true, model: "quality" }
  );
  speak(stream);

  const lastStep = await nextStep
  const shouldKeepPlaying = await lastStep.compute(
    mentalQuery(
      `
      Based on the user's interaction / input, I need to respond with the next logical step that would occur in this poker game, and 
      output some statistics and insights as I deal to help the user improve their poker playing techniques and teach them about poker 
      strategy.
      `
      ),
  )
  if (shouldKeepPlaying) {
    const finalStep = lastStep.withMonologue(html`
      ${initialStep.entityName} thought to themself: I am playing poker with the user right now, and need to decide how to continue 
      this game acting as the poker AI / card dealer and their house opponent. I need to make reasonable decisions based on my
      own hand against the user to help challenge them. As a poker tutor, I need to let the user know how they are doing after 
      every turn with statistical analysis and insights on performance, and give them tips on how to improve.
    `)
    setNextProcess(assists)
    return finalStep
  }

  return lastStep
}

export default playPoker