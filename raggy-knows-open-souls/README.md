The Soul Engine
=================

The **Soul Engine** is a powerful tool for creating, developing, and deploying AI souls. Unlike ChatBots, which are reactive systems, souls are dynamic, agentic, and stateful entities that are steerable by the developer, enabling the creation of engaging user and player experiences interacting with the souls.

# QuickStart

To get started, clone a soul and its code to your local machine

```bash
npx soul-engine init <my-soul-name>
```

Finally, navigate to the root directory of your cloned soul and run

```bash
cd <my-soul-name>
npx soul-engine dev
```

which will connect your soul to the engine.

> ⓘ When your soul is connected to the engine, any file changes are watched and pushed to the engine. The soul is then continually hosted live behind API

# Integrating with your application

Integrating a soul with your application is simple via the `soul-engine/souls` API. The API offers `ReplicaCycle`, a client that manages connections with a soul running on the engine, including across cycles with different users.

```javascript
import { ReplicaCycle, Actions, said, Events } from "soul-engine/soul";

// connect to the hosted soul running the subroutine "opensouls/samantha-provokes"
const samantha = new ReplicaCycle({
  organization: "opensouls",
  subroutine: "samantha-provokes",
})

// start a new cycle with the soul
const cycleId = await samantha.start()

// register listener to "SAYS" events from the soul
samantha.on(Actions.SAYS, ({ content, stream }) => {
  // stream is a function that returns an AsyncIterable<string>
  for await (const message of stream()) {
    // do things
  }
  // content returns a Promise<string> that will
  // resolve when all content is available
  console.log(await content())
})

// give the soul a new perception of the user saying 'Hi!'
await samantha.newPerception(said("User", "Hi!"))
```

Any cycle can be resumed at a later point in time as well

```javascript
const samantha = new ReplicaCycle({
  organization: "opensouls",
  subroutine: "samantha-provokes"
})

await samantha.resume(cycleId)
```

> 🚧 Currently the dev and production environments *are the same*, so whatever files are deployed via `npx soulengine` for your soul are the ones being run by the engine

# API Reference

The **Soul Engine** API has two major components:

- [Souls API](#souls-api) - integrate hosted souls into your applications
- [Engine API](#engine-api) - create, debug, and host souls

## Souls API

The `ReplicaCycle` API provides a convenient way to integrate hosted souls defined via the [Engine API](#engine-api) into your applications.

```javascript
const samantha = new ReplicaCycle({
  organization: "opensouls",
  subroutine: "samantha-provokes",
})
```

*Parameters*:
- `organization`: the organization's unique identifier
- `subroutine`: unique *url-safe* name for the subroutine to pull from the `organization` organization

*Methods*:
- `start()`: initiates execution of the new soul's [Subroutine](#soul-blueprint), returns the promise of a `cycleId` upon connection
- `resume(cycleId: string)`: *resumes* execution of the new soul's [Subroutine](#soul-blueprint) in the cycle associated with the `cycleId`, returns a promise of the cycleId upon connection
- `newPerception(perception: string)`: pushes a new memory on the soul's working memory and calls execution of the `Subroutine`'s current `MentalProcess`, possibly triggering a `SAYS` event. We provide convenience methods for different perceptions such as `says(userName: string, message: string)`
- `stop()`: closes the `ReplicaCycle`

> 🚧 Currently the API is unauthenticated - will add authentication here on request

## Engine API

The **Soul Engine** provides a powerful and extensible API for directing the cognition of AI souls. At a high level, unlike existing tools like the Assistants API, Inworld, or Character.AI, the **Soul Engine** provides an API for the specification of digital souls as dynamical and responsive stateful systems.

### Soul Blueprint

Creating a soul powered by the **Soul Engine** begins with creation of a soul `Blueprint` in the `/src` directory of a soul's project, which defines the execution of a something we call a soul's `Subroutine`.

> ⓘ The nomenclature of subroutine is inspired by named by the subroutines of Data in Star Trek, which encapsulate an entity performing a particular skill or behavior in a defined scenario over some particular time.

Specifically, the `Blueprint` is defined and exported in the `src/soul.ts` file of a project. Let's consider the following example `Blueprint`:

```javascript
// src/soul.ts

import { Blueprint } from "@opensouls/engine";
import provokesSpeaker from "./provokesSpeaker.js";
import playsVictim from "./playsVictim.js";
import { html } from "common-tags";

const blueprint: Blueprint = {
  subroutine: "samantha-shouts",
  entity: "Samantha",
  context: html`
    You are modeling the mind of Samantha.

    ## Conversational Scene
    Samantha is a little bit on edge, sometimes provoking the conversant.

    ## Samantha's Speaking Style
    * Samantha speaks very informally, mostly lowercase.
    * Lots of gen-z slang. 
    * Samantha texts MAX 1-2 sentences at a time
  `,
  initialProcess: provokesSpeaker,
  mentalProcesses: [
    provokesSpeaker,
    playsVictim,
  ],
}

export blueprint;
```

*Parameters*:
The definition of a `Blueprint` comprises:
- `subroutine`: *url-safe* name of the subroutine
- `entity`: the name of the soul's self identification
- `context`: the high level context for the soul during the running of the subroutine
- `initialProcess`: a reference to a [`MentalProcess`](#mentalprocess). This process serves as the entrypoint to the soul's cognition
- `mentalProcesses`: a list of every [`MentalProcess`](#mentalprocess) that the Subroutine might visit in the *main thread*
- `subprocesses` (optional): a list of every [`MentalProcess`](#mentalprocess) that is run continuously as a [*sub*process](#subprocesses) of the main thread

### MentalProcess

The `MentalProcess` API gives a powerful and functional way to specify stateful behavior of a soul, triggered by an external `Perception`.

A soul's `Subroutine` only ever has a single (main-threaded) active `MentalProcess`, which defines the current behavior set. When a `MentalProcess` executes, it operates on the current `step` of the `WorkingMemory`, returning a new `step` of the `WorkingMemory`.

> ⓘ As the `WorkingMemory` grows with new memories, the oldest memories are compressed and stored to potentially be recalled

During operation on the `WorkingMemory`'s current step, a soul will often generate new memories like `internalMonologue` or `externalDialog` and take actions like `speak`.

Every mental process needs to be defined and exported as its own file:

```javascript
// src/exampleProcess.js

const exampleProcess: MentalProcess = async ({ step: initialStep, subroutine, params }) => {
  let step = initialStep
  // operations on the working memory step ...

  return step
}

export default exampleProcess
```

*Parameters*:
- `step`: a instance of a `CortexStep` representing the current state of the `WorkingMemory`, containing the latest `Perception` for operation on
- `subroutine`: the [`Subroutine` object](#subroutine) containing hooks for adding stateful behavior to the functional representation of a `MentalProcess`
- `params`: static props passed into the `MentalProcess`, e.g. `{ wasProvoked: true }`

#### SubProcesses

`MentalProcesses` can be launched to run continuously in the background following each run of the main-thread `MentalProcess` by specifying them in the `subprocesses` parameter of the soul's [`Blueprint`](#soul-blueprint). The behavior of `subprocesses` is the following:
- They operate on the `WorkingMemory`, identical to the main-threaded process
- Each subprocess runs in order of the `subprocesses` list
- Any new incoming `Perception` terminates execution of the `subprocesses`

### Subroutine

The engine's `Subroutine` API uses hooks to manage side-effects and stateful behavior during `MentalProcess` execution.

> ⓘ The `use` paradigm is modelled after React hooks, which allow for stateful dynamics inside functional representations of behavior.

#### useCycleMemory

```
const { set, get, search } = useCycleMemory()
```

#### useProcessManager

`useProcessManager` is a `Subroutine` hook that gives access to management of the active `MentalProcess`

```javascript
const { invocationCount, setNextProcess } = useProcessManager()
```

*Returns*:
- `invocationCount`: a counter for runs of a `MentalProcess`, 0 indexed, that resets on process change
- `setNextProcess(process: MentalProcess, params?: PropType)`: schedules the next `MentalProcess` that will run after the next `Perception` occurs by reference to another `MentalProcess`. Optionally, parameters can be passed to the next `MentalProcess` via the `params`, e.g. `{ wasProvoked: true }`

#### useActions

`useActions` is a subroutine hook that gives access to available actions a soul can take in its environment

```javascript
const { speak, leaveConversation } = useActions()
```

*Returns*:
- `speak(message: string)`: tells the soul to send a message externally
- `leaveConversation()`: terminates execution of the soul's `Subroutine`

#### useProcessMemory

`useProcessMemory` is a `Subroutine` hook that returns a local memory container as a way to persist information outside the `WorkingMemory` across invocations of a `MentalProcess`

```javascript
const wasProvoked = useProcessMemory(false)

console.log("current value of wasProvoked", wasProvoked.current)

// set the current value immediately
wasProvoked.current = true
```

> ⓘ Process memories persist while a `MentalProcess` is continually invoked, but reset when the process changes

### Putting it all together

Here's a simple example `MentalProcess` that uses many of the API features to define an interesting behavior, which provokes the user, and then plays victim after

```javascript
// src/provokesSpeaker.js

import { ChatMessageRoleEnum, brainstorm, decision, externalDialog } from "socialagi";
import { MentalProcess, mentalQuery } from "soul-engine";
import playsVictim from "./playsVictim.js";

const provokesSpeaker: MentalProcess = async ({ step: initialStep, subroutine: { useProcessManager, useProcessMemory, useActions } }) => {
  const { speak } = useActions()
  const { invocationCount, setNextProcess } = useProcessManager()

  let step = initialStep
  step = await initialStep.next(externalDialog("Try to provoke the speaker"));
  speak(step.value);

  const provocationDecision = (await step.next(mentalQuery("Has Samantha successfully provoked the speaker?"))).value;
  if (provocationDecision && invocationCount > 0) {
    setNextProcess(playsVictim)
    return step
  }

  return step
}

export default provokesSpeaker
```

Generally, creating interesting user interactions with souls requires many different mental processes to define the flow of an experience.

> ⓘ This stateful behavior could alternatively be expressed via [`useProcessMemory`](#useprocessmemory) to store the state of the provocation decision, however, complexity managing state in this way grows quickly. `useProcessMemory` is often better for remembering stateful interactions grouped in a single process like the value of an object a user picked.

### Models

The engine supports two different GPT-based models for steps taken with SocialAGI `CortexStep`:

- `"fast"`
- `"quality"`

Right now, these map onto particular freezes of OpenAI models, but over time will change. We're experimenting with using OSS models for `"fast"` internally.

By default, `"fast"` is chosen, but the choice can be explicit via:

```javascript
step = await step.next(..., { model: "quality" })
```

Generally we recommend using `"fast"` for many internal thought processes and `"quality"` for the generation that a user or player interacts with.
