<template>
  <b-container fluid class="p-3">
    <b-row>
      <b-col>
        <RecipeBook />
      </b-col>
      <b-col>
        <PantryBlock />
        <ShoppingCart />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
export default {
  name: 'IndexPage',
  async mounted () {
    if (this.$store.state.ingredients.listenerUnsubscribe === null) {
      await this.$store.dispatch('ingredients/getIngredients', this)
    }
    if (this.$store.state.recipes.listenerUnsubscribe === null) {
      await this.$store.dispatch('recipes/getRecipes', this)
    }
  }
}
</script>
