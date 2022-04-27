<template>
  <div class="container-flex">
    <b-card header="Recipes" header-tag="header">
      <b-table-simple bordered hover class="mb-0">
        <b-thead>
          <b-tr>
            <b-th>Name</b-th>
            <b-th>Ingredients</b-th>
            <b-th class="text-right">
              Available to Make?
            </b-th>
          </b-tr>
        </b-thead>
        <b-tbody>
          <b-tr v-for="recipe in $store.state.recipes.recipes" :key="recipe.id" :style="checkSearchFilter(recipe) ? '':'display: none;'">
            <b-td>{{ recipe.name }}</b-td>
            <b-td>{{ $store.getters['recipes/getIngredientList'](recipe.id).map(obj => obj.name + ': ' + obj.quantity).join('\n') }}</b-td>
            <b-td class="text-right">
              {{ $store.getters['recipes/getRecipeMakeableStatus'](recipe.id) ? 'Yes' : 'No' }}
            </b-td>
          </b-tr>
        </b-tbody>
      </b-table-simple>
    </b-card>
  </div>
</template>

<script>
export default {
  name: 'RecipeBook',
  methods: {
    checkSearchFilter (recipe) {
      if (this.$store.state.search.searchTerm !== '') {
        return !!this.$store.getters['search/filteredRecipes'].includes(recipe.id) || !!this.$store.getters['search/filteredIngredients'].some(ingredient => this.$store.getters['recipes/getIngredientList'](recipe.id).map(obj => obj.id).includes(ingredient))
      } else {
        return true
      }
    }
  }
}
</script>
