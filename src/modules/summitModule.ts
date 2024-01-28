import { type TerrainAchievements } from '@/types/terrainTypes'
import { fetchUnitAchievements } from '@/services'
import { type ActionContext, type Module } from 'vuex/types/index'
import { type TerrainRootState } from '@/types/terrainState'

interface State {
  message: string
  helpButton: boolean
  achievements: TerrainAchievements[]
  achievementsTimestamp: null | number
}

const SummitModule: Module<State, TerrainRootState> = {
  namespaced: true,
  state: {
    ...{
      message: 'Welcome To Summit!',
      helpButton: true,
      achievements: [],
      achievementsTimestamp: null
    },
    ...JSON.parse(localStorage.getItem('SummitState') ?? '{}')
  },
  mutations: {
    updateMessage (state: { message: string }, newMessage: string) {
      state.message = newMessage
    },
    toggleHelpButton (state: { helpButton: boolean }) {
      state.helpButton = !state.helpButton
      const freshworksContainer = document.getElementById('freshworks-container')
      if (freshworksContainer != null) {
        freshworksContainer.style.display = state.helpButton ? 'block' : 'none'
      }
    },
    saveStateToLocalStorage (state: State) {
      const data = {
        helpButton: state.helpButton
      }
      localStorage.setItem('SummitState', JSON.stringify(data))
      console.log('SummitState saved')
    },
    updateAchievements (state: { achievements: TerrainAchievements[], achievementsTimestamp: number | null }, payload: { achievements: TerrainAchievements[], timestamp: number }) {
      state.achievements = payload.achievements
      state.achievementsTimestamp = payload.timestamp
    }
  },
  actions: {
    saveState ({ commit }: ActionContext<State, TerrainRootState>): void {
      commit('saveStateToLocalStorage')
    },
    setMessage ({ commit }: ActionContext<State, TerrainRootState>, message: string): void {
      commit('updateMessage', message)
    },
    toggleHelpButton ({ commit }: ActionContext<State, TerrainRootState>): void {
      commit('toggleHelpButton')
      commit('saveStateToLocalStorage')
    },
    async getAchievements ({ commit }: ActionContext<State, TerrainRootState>): Promise<void> {
      const achievements = (await fetchUnitAchievements())
      commit('updateAchievements', { achievements, timestamp: Date.now() })
    },
    initialize (context: ActionContext<State, TerrainRootState>): void {
      const freshworksContainer = document.getElementById('freshworks-container')
      if (freshworksContainer != null) {
        freshworksContainer.style.display = context.getters.getHelpButton ? 'block' : 'none'
      }
    }
  },
  getters: {
    getMessage (state: { message: string }) {
      return state.message
    },
    getHelpButton (state: { helpButton: boolean }) {
      return state.helpButton
    },
    getAchievements (state, _getters, _rootState, rootGetters) {
      const FIVE_MINS = 5 * 60 * 1000
      if ((state.achievementsTimestamp == null) || Date.now() - state.achievementsTimestamp > FIVE_MINS) {
        rootGetters.dispatch('getAchievements')
      }
      return state.achievements
    }
  }
}

export default SummitModule
