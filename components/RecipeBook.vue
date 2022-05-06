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
            <b-td>{{ recipe.name }}</b-td>
            <b-td>
              <ul class="mb-0">
                <li v-for="ingredient in $store.getters['recipes/getIngredientList'](recipe.id).map(obj => obj.name + ': ' + obj.quantity)" :key="ingredient">
                  {{ ingredient }}
                </li>
              </ul>
            </b-td>
            <b-td>
              <p class="mb-0">{{ $store.getters['recipes/getRecipeMakeableStatus'](recipe.id) ? 'Yes' : 'No' }}</p>
              <p class="mb-0">{{ getRemainingIngredients(recipe.id) }}</p>
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
              <b-button variant="primary" block @click="openRecipeModal('')">
                New Recipe
              </b-button>
            </b-td>
          </b-tr>
        </b-tbody>
      </b-table-simple>
    </b-card>
    <b-modal
      id="submit-recipe-modal"
      ref="submit-recipe-modal"
      title="Recipe"
      no-close-on-backdrop
      no-close-on-esc
      ok-title="Submit"
      cancel-title="Cancel"
      size="lg"
      @cancel="handleRecipeCancel"
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
            placeholder="Enter Recipe Name"
            required
          />
        </b-form-group>
        <b-form-group
          id="input-group-2"
          label="Recipe Ingredients:"
        >
          <b-table-simple bordered hover class="mb-0">
            <b-thead>
              <b-tr>
                <b-th>Ingredient</b-th>
                <b-th>Quantity</b-th>
                <b-th />
              </b-tr>
            </b-thead>
            <b-tbody>
              <b-tr v-for="ingredient in currentRecipe.recipeIngredients" :key="ingredient.id">
                <b-td>
                  <b-form-input
                    id="ingredient-quantity"
                    :value="ingredientNameFromId(ingredient.id)"
                    readonly
                  />
                </b-td>
                <b-td>
                  <b-form-input
                    id="ingredient-quantity"
                    v-model="ingredient.quantity"
                    type="number"
                    min="1"
                  />
                </b-td>
                <b-td class="text-right">
                  <b-button v-b-tooltip.hover variant="danger" title="Cancel Ingredient Update" @click="removeIngredient(ingredient.id)">
                    <b-icon-trash />
                  </b-button>
                </b-td>
              </b-tr>
              <b-tr v-if="!allIngredientsUsed">
                <b-td>
                  <b-form-select v-model="newIngredient.id">
                    <b-form-select-option :value="''" disabled>
                      Please Select An Ingredient
                    </b-form-select-option>
                    <b-form-select-option v-for="item in remainingIngredients" :key="item.id" :value="item.id">
                      {{ item.name }}
                    </b-form-select-option>
                  </b-form-select>
                </b-td>
                <b-td>
                  <b-form-input
                    id="input-2"
                    v-model="newIngredient.quantity"
                    type="number"
                    min="1"
                    placeholder="Enter Ingredient Quantity"
                    required
                  />
                </b-td>
                <b-td class="text-right">
                  <b-button v-b-tooltip.hover variant="success" title="Submit New Ingredient" @click="addIngredient">
                    <b-icon-check />
                  </b-button>
                  <b-button v-b-tooltip.hover variant="danger" title="Reset New Ingredient" @click="resetIngredient">
                    <b-icon-x />
                  </b-button>
                </b-td>
              </b-tr>
            </b-tbody>
          </b-table-simple>
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
        recipeIngredients: []
      },
      newIngredient: {
        id: '',
        quantity: 1
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
    },
    remainingIngredients () {
      const usedIngredients = this.currentRecipe.recipeIngredients.map(ingredient => ingredient.id)
      return this.$store.state.ingredients.ingredients.filter(ingredient => !usedIngredients.includes(ingredient.id))
    },
    allIngredientsUsed () {
      return (this.remainingIngredients.length === 0)
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
    getRemainingIngredients (id) {
      if (!this.$store.getters['recipes/getRecipeMakeableStatus'](id)) {
        return this.$store.getters['recipes/getRemainingIngredients'](id)
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
    resetCurrentRecipe () {
      this.currentRecipe = { id: '', name: '', recipeIngredients: [] }
    },
    ingredientNameFromId (id) {
      return this.$store.state.ingredients.ingredients.find(ingredient => ingredient.id === id) ? this.$store.state.ingredients.ingredients.find(ingredient => ingredient.id === id).name : 'Unknown Ingredient'
    },
    addIngredient () {
      if (this.newIngredient.id !== '') {
        this.currentRecipe.recipeIngredients.push(this.newIngredient)
        this.resetIngredient()
      } else {
        this.$bvToast.toast('Please select an ingredient.', {
          title: 'Error',
          toaster: 'b-toaster-top-center',
          variant: 'warning',
          autoHideDelay: 1500
        })
      }
    },
    resetIngredient () {
      this.newIngredient = { id: '', quantity: 1 }
    },
    removeIngredient (id) {
      this.currentRecipe.recipeIngredients = this.currentRecipe.recipeIngredients.filter(ingredient => ingredient.id !== id)
    },
    async handleRecipeOk (bvModalEvt) {
      try {
        bvModalEvt.preventDefault()
        if (!this.currentRecipe.name || /^\s*$/.test(this.currentRecipe.name)) {
          this.$bvToast.toast('Recipe Name Cannot Be Blank', {
            title: 'ERROR',
            toaster: 'b-toaster-top-center',
            variant: 'danger',
            autoHideDelay: 3000
          })
          return
        }
        if (this.currentRecipe.recipeIngredients.some(ingredient => ingredient.quantity < 1)) {
          this.$bvToast.toast('All Ingredients Must Have Quantity Greater Than One', {
            title: 'ERROR',
            toaster: 'b-toaster-top-center',
            variant: 'danger',
            autoHideDelay: 3000
          })
          return
        }
        const copy = JSON.parse(JSON.stringify(this.currentRecipe))
        if (this.currentRecipe.id) {
          await this.$store.dispatch('recipes/editRecipe', { vm: this, docid: this.currentRecipe.id, parameters: copy })
        } else {
          await this.$store.dispatch('recipes/addRecipe', { vm: this, parameters: copy })
        }
        this.resetCurrentRecipe()
        this.resetIngredient()
        this.$nextTick(() => {
          this.$bvModal.hide('submit-recipe-modal')
        })
      } catch (error) {
        this.$bvToast.toast('Create Error\n' + error, {
          title: 'Error',
          toaster: 'b-toaster-top-center',
          variant: 'danger',
          autoHideDelay: 3000
        })
      }
    },
    handleRecipeCancel (bvModalEvt) {
      bvModalEvt.preventDefault()
      this.resetCurrentRecipe()
      this.resetIngredient()
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
