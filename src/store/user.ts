import { defineStore } from 'pinia'
import { getCacheUser, setCacheUser, type CacheUser } from '@/utils/cache'

export const useUserStore = defineStore('user', {
  state: (): CacheUser => getCacheUser(),
  actions: {
    setUser(user: CacheUser) {
      setCacheUser(user)
      this.username = user.username
      this.nickname = user.nickname
    },
  },
})
