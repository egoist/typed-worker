import { handleActions } from "../src"

export const actions = {
  sum(a: number, b: number) {
    return a + b
  },
  async errorFunction() {
    throw new Error("something is wrong")
  },
}

export type Actions = typeof actions

handleActions(actions)
