import { createWorker } from "../src/index"
import { Actions } from "./worker"

const worker = createWorker<Actions>(
  () =>
    new Worker(new URL("worker.ts", import.meta.url), {
      type: "module",
    }),
)

worker.run("sum", 1, 2).then((result) => {
  const div = document.createElement("div")
  div.id = "worker-result"
  div.textContent = `${result}`
  document.body.append(div)
})

const iframe = createWorker<Actions>(() => {
  return document.querySelector<HTMLIFrameElement>("iframe")!
})

iframe.run("sum", 2, 3).then((result) => {
  const div = document.createElement("div")
  div.id = "iframe-result"
  div.textContent = `${result}`
  document.body.append(div)
})
