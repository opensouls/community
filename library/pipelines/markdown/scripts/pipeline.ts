#!/usr/bin/env npx tsx
import { $ } from "execa"
import run from "../src/pipeline/run.js"

await run()
await $`npx soul-engine stores push default`
