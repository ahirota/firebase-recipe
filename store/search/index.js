import * as JsSearch from 'js-search'

export const state = () => ({
  searchTerm: ''
})

export const getters = {
  filteredRecipes (state, getters, rootState) {
    const engsearch = new JsSearch.Search('id')
    engsearch.indexStrategy = new JsSearch.AllSubstringsIndexStrategy()

    engsearch.addIndex('name')

    engsearch.addDocuments(rootState.recipes.recipes)

    return engsearch.search(state.searchTerm).map(item => item.id)
  },
  filteredIngredients (state, getters, rootState) {
    const engsearch = new JsSearch.Search('id')
    engsearch.indexStrategy = new JsSearch.AllSubstringsIndexStrategy()

    engsearch.addIndex('name')

    engsearch.addDocuments(rootState.ingredients.ingredients)

    return engsearch.search(state.searchTerm).map(item => item.id)
  }
}

export const mutations = {
  setSearchTerm (state, value) {
    state.searchTerm = value
  }
}

export const actions = {}
