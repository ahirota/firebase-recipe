export const state = () => ({
  recipes: [],
  listenerUnsubscribe: null
})

export const getters = {
  getIngredientList: (state, getters, rootState) => (id) => {
    let ingredient
    const currentRecipe = state.recipes.find(recipe => recipe.id === id)

    return currentRecipe.recipeIngredients.map((recipeIngredient) => {
      ingredient = rootState.ingredients.ingredients.find(ingredient => ingredient.id === recipeIngredient.id)
      if (!ingredient) {
        return 'Missing Ingredient'
      }
      return { id: ingredient.id, name: ingredient.name, quantity: recipeIngredient.quantity }
    })
  },
  getRecipeMakeableStatus: (state, getters, rootState) => (id) => {
    let ingredient; let canMake = true
    const currentRecipe = state.recipes.find(recipe => recipe.id === id)

    currentRecipe.recipeIngredients.forEach((recipeIngredient) => {
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
  },
  async submitRecipe ({ dispatch, commit, state, rootState }, { vm, docid, parameters }) {
    try {
      let recipeRef
      if (docid) {
        recipeRef = this.$fire.firestore.collection('recipes').doc(docid)
      } else {
        this.$fire.firestore.collection('recipes').doc()
      }
      await recipeRef.set(parameters, { merge: true })
    } catch (error) {
      vm.$bvToast.toast('Database Error\n' + error, {
        title: 'ERROR',
        toaster: 'b-toaster-top-center',
        variant: 'danger',
        autoHideDelay: 3000
      })
    }
  },
  async deleteRecipe ({ dispatch, commit, state, rootState }, { vm, recipeId }) {
    try {
      await this.$fire.firestore.collection('recipes').doc(recipeId).delete()
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
