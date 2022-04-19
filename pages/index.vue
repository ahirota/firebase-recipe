<template>
  <Tutorial />
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
