export const state = () => ({
  ingredients: [],
  listenerUnsubscribe: null
})

export const getters = {

}

export const mutations = {
  setIngredients (state, value) {
    state.ingredients = value
  },
  SET_LISTENER_UNSUBSCRIBE (state, val) {
    state.listenerUnsubscribe = val
  },
  RESET_STORE (state) {
    state.listenerUnsubscribe()
    state.listenerUnsubscribe = null
  }
}

export const actions = {
  getIngredients ({ state, commit }, { vm }) {
    const unsubscribe = this.$fire.firestore.collection('ingredients')
      .onSnapshot((querySnapshot) => {
        const ingredients = []
        querySnapshot.forEach(function (doc) {
          ingredients.push({
            id: doc.id,
            name: doc.data().name,
            quantity: doc.data().quantity
          })
        },
        (error) => {
          vm.$bvToast.toast('Database Error\n' + error, {
            title: 'ERROR',
            toaster: 'b-toaster-top-center',
            variant: 'danger',
            autoHideDelay: 3000
          })
        }
        )
        commit('setIngredients', ingredients)
      })
    commit('SET_LISTENER_UNSUBSCRIBE', unsubscribe)
  },
  resetIngredientsList ({ state, commit }) {
    if (state.listenerUnsubscribe !== null) {
      commit('RESET_STORE')
    }
    commit('setIngredients', [])
  },
  async addIngredient ({ dispatch, commit, state, rootState }, { vm, parameters }) {
    try {
      await this.$fire.firestore.collection('ingredients').doc().set(parameters, { merge: true })
    } catch (error) {
      vm.$bvToast.toast('Database Error\n' + error, {
        title: 'ERROR',
        toaster: 'b-toaster-top-center',
        variant: 'danger',
        autoHideDelay: 3000
      })
    }
  },
  async editIngredient ({ dispatch, commit, state, rootState }, { vm, docid, parameters }) {
    try {
      await this.$fire.firestore.collection('ingredients').doc(docid).set(parameters, { merge: true })
    } catch (error) {
      vm.$bvToast.toast('Database Error\n' + error, {
        title: 'ERROR',
        toaster: 'b-toaster-top-center',
        variant: 'danger',
        autoHideDelay: 3000
      })
    }
  },
  async deleteIngredient ({ dispatch, commit, state, rootState }, { vm, ingredientId }) {
    try {
      await this.$fire.firestore.collection('ingredients').doc(ingredientId).delete()
    } catch (error) {
      vm.$bvToast.toast('Database Error\n' + error, {
        title: 'ERROR',
        toaster: 'b-toaster-top-center',
        variant: 'danger',
        autoHideDelay: 3000
      })
    }
  }
}
