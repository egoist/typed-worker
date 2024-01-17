import { createWorker } from "../src/index"
import { Actions } from "./worker"

const worker = createWorker<Actions>(
  () =>
    new Worker(new URL("worker.ts", import.meta.url), {
      type: "module",
    }),
)

const createResult = (id: string, result: any) => {
  const div = document.createElement("div")
  div.id = id
  div.textContent = `${result}`
  document.body.append(div)
}

worker.run("sum", 1, 2).then((result) => {
  createResult("worker-result", result)
})

worker.run("isTransparent", []).then((result) => {
  createResult("falsy-result", result)
})

const iframe = createWorker<Actions>(() => {
  return document.querySelector<HTMLIFrameElement>("iframe")!
})

iframe.run("sum", 2, 3).then((result) => {
  createResult("iframe-result", result)
})

worker.run("errorFunction").catch((error) => {
  console.error(error)
  createResult("error-result", error.message)
})
