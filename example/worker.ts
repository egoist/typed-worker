import { handleActions } from "../src"

export const actions = {
  sum(a: number, b: number) {
    return a + b
  },
  isTransparent(data: ArrayLike<number>) {
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] === 0) return true
    }

    return false
  },
  async errorFunction() {
    throw new Error("something is wrong")
  },
}

export type Actions = typeof actions

handleActions(actions)
