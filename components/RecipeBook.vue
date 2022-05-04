<template>
  <div class="container-flex">
    <b-card header="Recipes" header-tag="header">
      <b-table-simple bordered hover class="mb-0">
        <b-thead>
          <b-tr>
            <b-th>Name</b-th>
            <b-th>Ingredients</b-th>
            <b-th>Available to Make?</b-th>
            <b-th />
          </b-tr>
        </b-thead>
        <b-tbody>
          <b-tr v-for="recipe in $store.state.recipes.recipes" :key="recipe.id" :style="checkSearchFilter(recipe) ? '':'display: none;'">
            <b-td><p>{{ recipe.name }}</p></b-td>
            <b-td>{{ $store.getters['recipes/getIngredientList'](recipe.id).map(obj => obj.name + ': ' + obj.quantity).join('\n') }}</b-td>
            <b-td>
              {{ $store.getters['recipes/getRecipeMakeableStatus'](recipe.id) ? 'Yes' : 'No' }}
            </b-td>
            <b-td class="text-right">
              <b-button variant="primary" @click="openRecipeModal(recipe.id)">
                <b-icon-pencil-square />
              </b-button>
              <b-button variant="danger" @click="openDeleteRecipeModal(recipe.id)">
                <b-icon-trash />
              </b-button>
            </b-td>
          </b-tr>
          <b-tr>
            <b-td colspan="4">
              <b-button variant="primary" block @click="openRecipeModal()">
                New Recipe
              </b-button>
            </b-td>
          </b-tr>
        </b-tbody>
      </b-table-simple>
    </b-card>
    <b-modal
      id="submit-recipe"
      ref="submit-recipe-modal"
      title="Recipe"
      no-close-on-backdrop
      no-close-on-esc
      ok-title="Submit"
      cancel-title="Cancel"
      size="lg"
      @cancel="handleCreateCancel"
      @ok="handleRecipeOk"
    >
      <form ref="form" @submit.stop.prevent="handleRecipeOk">
        <b-form-group
          id="input-group-1"
          label="Recipe Name:"
          label-for="input-1"
        >
          <b-form-input
            id="input-1"
            v-model="currentRecipe.name"
            type="input"
            placeholder="Enter Recipe Name"
            required
          />
        </b-form-group>
      </form>
    </b-modal>
    <b-modal
      id="delete-recipe-modal"
      ref="delete-recipe-modal"
      title="Delete This Recipe?"
      no-close-on-backdrop
      no-close-on-esc
      ok-variant="danger"
      ok-title="Delete"
      cancel-title="Cancel"
      @cancel="handleDeleteCancel"
      @ok="handleRecipeDelete"
    >
      <p>Are you sure you want to delete this recipe?</p>
      <p>{{ deleteRecipeFormat }}</p>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: 'RecipeBook',
  data () {
    return {
      currentRecipe: {
        id: '',
        name: '',
        recipeIngredients: [{ id: '', quantity: 1 }]
      },
      deleteRecipeId: ''
    }
  },
  computed: {
    deleteRecipeFormat () {
      if (this.deleteRecipeId) {
        const recipe = this.$store.state.recipes.recipes.find(recipe => recipe.id === this.deleteRecipeId)
        if (recipe) {
          const ingredientList = this.$store.getters['recipes/getIngredientList'](this.deleteRecipeId)
          const formatted = recipe.name + '<br>-----------<br>' + ingredientList.map(ingredient => ingredient.name + ': ' + ingredient.quantity).join('<br>')
          return formatted
        }
      }
      return ''
    }
  },
  methods: {
    checkSearchFilter (recipe) {
      if (this.$store.state.search.searchTerm !== '') {
        return !!this.$store.getters['search/filteredRecipes'].includes(recipe.id) || !!this.$store.getters['search/filteredIngredients'].some(ingredient => this.$store.getters['recipes/getIngredientList'](recipe.id).map(obj => obj.id).includes(ingredient))
      } else {
        return true
      }
    },
    openRecipeModal (id = '') {
      this.setRecipeModalParams(id)
      this.$bvModal.show('submit-recipe-modal')
    },
    setRecipeModalParams (id) {
      if (id !== '') {
        const recipe = this.$store.state.recipes.recipes.find(recipe => recipe.id === id)
        this.currentRecipe.id = id
        this.currentRecipe.name = recipe.name
        this.currentRecipe.recipeIngredients = recipe.recipeIngredients
      }
    },
    async handleRecipeOk (bvModalEvt) {
      try {
        bvModalEvt.preventDefault()
        if (this.currentRecipe.name === '') {
          this.$bvToast.toast('', {
            title: 'Confirm',
            toaster: 'b-toaster-top-center',
            variant: 'warning',
            autoHideDelay: 1500
          })
          return
        }
        const copy = JSON.parse(JSON.stringify(this.currentRecipe))
        if (this.currentRecipe.id) {
          await this.$store.dispatch('recipe/editRecipe', { vm: this, docid: this.currentRecipe.id, parameters: copy })
        } else {
          await this.$store.dispatch('recipe/addRecipe', { vm: this, parameters: copy })
        }
        this.$bvModal.hide('submit-recipe-modal')
      } catch (error) {
        this.$bvToast.toast('Create Error\n' + error, {
          title: 'Error',
          toaster: 'b-toaster-top-center',
          variant: 'danger',
          autoHideDelay: 3000
        })
      }
    },
    handleCreateCancel (bvModalEvt) {
      bvModalEvt.preventDefault()
      this.$nextTick(() => {
        this.$bvModal.hide('submit-recipe-modal')
      })
    },
    openDeleteRecipeModal (recipeId) {
      this.$bvModal.show('delete-recipe-modal')
      this.deleteRecipeId = recipeId
    },
    async handleRecipeDelete (bvModalEvt) {
      try {
        bvModalEvt.preventDefault()
        await this.$store.dispatch('recipes/deleteRecipe', { vm: this, recipeId: this.deleteRecipeId })
        this.deleteRecipeId = ''
        this.$bvModal.hide('delete-recipe-modal')
      } catch (error) {
        this.$bvToast.toast('Recipe Delete Error\n' + error, {
          title: 'Error',
          toaster: 'b-toaster-top-center',
          variant: 'danger',
          autoHideDelay: 3000
        })
      }
    },
    handleDeleteCancel (bvModalEvt) {
      bvModalEvt.preventDefault()
      this.deleteRecipeId = ''
      this.$nextTick(() => {
        this.$bvModal.hide('delete-recipe-modal')
      })
    }
  }
}
</script>
