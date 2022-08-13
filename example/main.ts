import { createWorker } from "../src/index"

const worker = createWorker(
  () =>
    new Worker(new URL("worker.ts", import.meta.url), {
      type: "module",
    }),
)

worker.run("sum", { a: 1, b: 2 }).then((result) => {
  const div = document.createElement("div")
  div.id = "worker-result"
  div.textContent = `${result}`
  document.body.append(div)
})

const iframe = createWorker(() => {
  return document.querySelector<HTMLIFrameElement>("iframe")!
})

iframe.run("sum", { a: 2, b: 3 }).then((result) => {
  const div = document.createElement("div")
  div.id = "iframe-result"
  div.textContent = `${result}`
  document.body.append(div)
})
