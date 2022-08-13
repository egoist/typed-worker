import mitt from "mitt"

const uuid = () => globalThis.crypto.randomUUID()

const WORKER_READY_EVENT = "__READY__"

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
    const target = worker instanceof Worker ? worker : window
    target.addEventListener("message", (e) => {
      const data = (e as MessageEvent).data

      if (!data || typeof data !== "object") return

      const { id, result } = data
      if (id === WORKER_READY_EVENT) {
        resolveReady()
        return
      }
      emitter.emit(`${id}:result`, result)
    })
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
      const eventName = `${id}:result`
      emitter.on(eventName, (result: any) => {
        emitter.off(eventName)
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

  postMessage({ id: WORKER_READY_EVENT })

  onmessage = async (e: any) => {
    const { id, type, payload } = e.data

    const action = actions[type]
    if (action) {
      const result = await action(payload)
      postMessage({ id, result })
    }
  }
}
