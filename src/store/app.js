// Utilities
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    user: {}
  }),
  actions: {
    setUser(user) {
      this.user = user
    }
  }
})
