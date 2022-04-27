<template>
  <div class="container-flex">
    <b-card header="Ingredients" header-tag="header">
      <b-table-simple bordered hover class="mb-0">
        <b-thead>
          <b-tr>
            <b-th>Name</b-th>
            <b-th class="text-right">
              Stock On Hand
            </b-th>
          </b-tr>
        </b-thead>
        <b-tbody>
          <b-tr v-for="ingredient in $store.state.ingredients.ingredients" :key="ingredient.id" :style="checkSearchFilter(ingredient) ? '':'display: none;'">
            <b-td>{{ ingredient.name }}</b-td>
            <b-td class="text-right">
              {{ ingredient.quantity }}
            </b-td>
          </b-tr>
        </b-tbody>
      </b-table-simple>
    </b-card>
  </div>
</template>

<script>
export default {
  name: 'PantryBlock',
  methods: {
    checkSearchFilter (ingredient) {
      if (this.$store.state.search.searchTerm !== '') {
        return !!this.$store.getters['search/filteredIngredients'].includes(ingredient.id)
      } else {
        return true
      }
    }
  }
}
</script>
