export const state = () => ({
  recipes: [],
  listenerUnsubscribe: null
})

export const getters = {
  getRecipeMakeableStatus: (state, getters, rootState) => (id) => {
    let ingredient; let canMake = true
    const currentRecipe = state.recipes.find(recipe => recipe.id === id)

    currentRecipe.recipe_ingredients.forEach((recipeIngredient) => {
      ingredient = rootState.ingredients.ingredients.find(ingredient => ingredient.id === recipeIngredient.id)
      if (!ingredient) {
        canMake = false
      } else if (recipeIngredient.quantity > ingredient.quantity) {
        canMake = false
      }
    })

    return canMake
  }
}

export const mutations = {
  setRecipes (state, value) {
    state.recipes = value
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
  getRecipes ({ state, commit }, { vm }) {
    const unsubscribe = this.$fire.firestore.collection('recipes')
      .onSnapshot((querySnapshot) => {
        const recipes = []
        querySnapshot.forEach(function (doc) {
          recipes.push({
            id: doc.id,
            name: doc.data().name,
            recipeIngredients: doc.data().recipeIngredients
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
        commit('setRecipes', recipes)
      })
    commit('SET_LISTENER_UNSUBSCRIBE', unsubscribe)
  },
  resetRecipeList ({ state, commit }) {
    if (state.listenerUnsubscribe !== null) {
      commit('RESET_STORE')
    }
    commit('setRecipes', [])
  }
}
