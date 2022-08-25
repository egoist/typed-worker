import { handleActions } from "../src"

export const actions = {
  sum(a: number, b: number) {
    return a + b
  },
}

export type Actions = typeof actions

handleActions(actions)
