import { defineStore } from 'pinia'

export const useUIStore = defineStore('ui', {
  state: () => ({
    sidebarHidden: localStorage.getItem('devise-sidebar') === 'true',

  }),

  actions: {
    hideSidebar() {
      this.sidebarHidden = true
      localStorage.setItem('devise-sidebar', 'true')
    },
    showSidebar() {
      this.sidebarHidden = false
      localStorage.setItem('devise-sidebar', 'false')
    },
    toggleSidebar() {
      this.sidebarHidden = !this.sidebarHidden
      localStorage.setItem('devise-sidebar', String(this.sidebarHidden))
    }
    
  }
})
