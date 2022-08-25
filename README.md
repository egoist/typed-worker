**💛 You can help the author become a full-time open-source maintainer by [sponsoring him on GitHub](https://github.com/sponsors/egoist).**

---

# typed-worker

[![npm version](https://badgen.net/npm/v/typed-worker)](https://npm.im/typed-worker) [![npm downloads](https://badgen.net/npm/dm/typed-worker)](https://npm.im/typed-worker) [![paka type docs](https://badgen.net/badge/typedoc/typed-worker/pink)](https://paka.dev/npm/typed-worker)

## Install

```bash
npm i typed-worker
```

## Usage

Create a `worker.ts`:

```ts
import { handleActions } from "typed-worker"

export const actions = {
  async sum(a: number, b: number) {
    await someHeavyOperation()
    return a + b
  },
}

export type Actions = typeof actions

handleActions(actions)
```

In your `app.ts` where you want to use the worker:

```ts
import { createWorker } from "typed-worker"
import { type Actions } from "./worker"

const worker = createWorker<Actions>(
  // Require a bundler like Vite, webpack etc
  () =>
    new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    }),
)

const result = await worker.run("sum", 1, 2)

expect(result).toBe(3)
```

To use the `worker.ts` in an iframe instead of a web worker, you only need to return the `iframe` element in `createWorker` instead:

```ts
const iframe = createWorker<Actions>(
  () => document.querySelector<HTMLIframeElement>("#your-iframe-element")!,
)

const result = await iframe.run("sum", 1, 2)
```

## Sponsors

[![sponsors](https://sponsors-images.egoist.dev/sponsors.svg)](https://github.com/sponsors/egoist)

## License

MIT &copy; [EGOIST](https://github.com/sponsors/egoist)
