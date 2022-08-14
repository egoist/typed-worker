import mitt from "mitt"

const uuid = () => globalThis.crypto.randomUUID()

const WORKER_READY_MESSAGE_ID = "typed-worker-ready"
const IFRAME_ID_ATTR = "data-typed-worker"

type ActionsType = Record<string, (payload: any) => any>

export const createWorker = <TActions extends ActionsType>(
  create: () => Worker | HTMLIFrameElement,
) => {
  const emitter = mitt()

  let resolveReady: () => void

  const ready = new Promise<void>((resolve) => (resolveReady = resolve))

  let worker: Worker | HTMLIFrameElement | undefined
  if (typeof document !== "undefined") {
    worker = create()

    const readyMessageId =
      worker instanceof Worker ? WORKER_READY_MESSAGE_ID : uuid()

    const handleMessage = (e: any) => {
      const data = (e as MessageEvent).data

      if (!data || typeof data !== "object") return

      const { id, result } = data
      if (id === readyMessageId) {
        resolveReady()
        return
      }
      emitter.emit(id, result)
    }

    if (worker instanceof Worker) {
      worker.addEventListener("message", handleMessage)
    } else {
      worker.setAttribute(IFRAME_ID_ATTR, readyMessageId)
      window.addEventListener("message", handleMessage)
    }
  }

  const run = async <
    TType extends keyof TActions,
    TAction extends TActions[TType],
  >(
    type: TType,
    payload: Parameters<TAction>[0],
  ): Promise<ReturnType<TAction>> => {
    const id = uuid()
    await ready

    const result = new Promise<ReturnType<TAction>>((resolve) => {
      emitter.on(id, (result: any) => {
        emitter.off(id)
        resolve(result)
      })
      const message = { id, type, payload }
      if (worker instanceof Worker) {
        worker?.postMessage(message)
      } else if (worker) {
        worker?.contentWindow?.postMessage(message, "*")
      }
    })

    return result
  }

  const destroy = () => {
    if (worker && worker instanceof Worker) {
      worker.terminate()
    }
    worker = undefined
  }

  return { run, destroy }
}

declare const WorkerGlobalScope: any

export const handleActions = (actions: ActionsType) => {
  const inWorker =
    typeof WorkerGlobalScope !== "undefined" &&
    self instanceof WorkerGlobalScope

  const postMessage = (message: any) => {
    if (inWorker) {
      globalThis.postMessage(message)
    } else {
      window.parent.postMessage(message, "*")
    }
  }

  // Notify the main thread that the worker is ready
  const id = inWorker
    ? WORKER_READY_MESSAGE_ID
    : window.frameElement?.getAttribute(IFRAME_ID_ATTR)
  if (id) {
    postMessage({ id })
  }

  onmessage = async (e: any) => {
    const { id, type, payload } = e.data

    const action = actions[type]
    if (action) {
      const result = await action(payload)
      postMessage({ id, result })
    }
  }
}
