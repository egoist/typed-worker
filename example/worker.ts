import { handleActions } from "../src"

export const actions = {
  sum(payload: { a: number; b: number }) {
    return payload.a + payload.b
  },
}

export type Actions = typeof actions

handleActions(actions)
