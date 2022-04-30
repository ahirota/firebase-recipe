<template>
  <div class="container-flex">
    <b-card header="Ingredients" header-tag="header">
      <b-table-simple bordered hover class="mb-0">
        <b-thead>
          <b-tr>
            <b-th>Name</b-th>
            <b-th>
              Stock On Hand
            </b-th>
            <b-th />
          </b-tr>
        </b-thead>
        <b-tbody>
          <b-tr v-for="ingredient in $store.state.ingredients.ingredients" :key="ingredient.id" :style="checkSearchFilter(ingredient) ? '':'display: none;'">
            <b-td>{{ ingredient.name }}</b-td>
            <b-td>
              {{ ingredient.quantity }}
            </b-td>
            <b-td class="text-right">
              <b-button variant="danger" @click="openDeleteIngredientModal(ingredient.id)">
                <b-icon-trash />
              </b-button>
            </b-td>
          </b-tr>
          <b-tr>
            <b-td>
              <b-form-input
                id="input-1"
                v-model="newIngredient.name"
                placeholder="Enter Ingredient Name"
                required
              />
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
              <b-button variant="success" @click="createIngredient">
                <b-icon-upload /> Create
              </b-button>
            </b-td>
          </b-tr>
        </b-tbody>
      </b-table-simple>
    </b-card>
    <b-modal
      id="delete-ingredient-modal"
      ref="delete-ingredient-modal"
      title="Delete This Ingredient?"
      no-close-on-backdrop
      no-close-on-esc
      ok-variant="danger"
      ok-title="Delete"
      cancel-title="Cancel"
      @cancel="handleIngredientCancel"
      @ok="handleIngredientDelete"
    >
      <p>Are you sure you want to delete this Ingredient?</p>
      <p>{{ deleteIngredientFormat }}</p>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: 'PantryBlock',
  data () {
    return {
      newIngredient: {
        name: '',
        quantity: 0
      },
      deleteIngredientId: '',
      items: []
    }
  },
  computed: {
    deleteIngredientFormat () {
      if (this.deleteIngredientId !== '') {
        const ingredient = this.$store.state.ingredients.ingredients.find(ingredient => ingredient.id === this.deleteIngredientId)
        if (ingredient) {
          const formatted = ingredient.name + ': ' + ingredient.quantity
          return formatted
        }
      }
      return ''
    }
  },
  methods: {
    checkSearchFilter (ingredient) {
      if (this.$store.state.search.searchTerm !== '') {
        return !!this.$store.getters['search/filteredIngredients'].includes(ingredient.id)
      } else {
        return true
      }
    },
    async createIngredient () {
      if (!this.newIngredient.name || /^\s*$/.test(this.newIngredient.name)) {
        this.$bvToast.toast('Ingredient Name Cannot Be Blank', {
          title: 'ERROR',
          toaster: 'b-toaster-top-center',
          variant: 'danger',
          autoHideDelay: 3000
        })
        return
      }

      if (this.newIngredient.quantity < 1) {
        this.$bvToast.toast('Ingredient Must Have Quantity Greater Than One', {
          title: 'ERROR',
          toaster: 'b-toaster-top-center',
          variant: 'danger',
          autoHideDelay: 3000
        })
        return
      }

      const copy = JSON.parse(JSON.stringify(this.newIngredient))
      await this.$store.dispatch('ingredients/addIngredient', { vm: this, parameters: copy })
      this.newIngredient = {
        name: '',
        quantity: 0
      }
    },
    openDeleteIngredientModal (ingredientId) {
      this.$bvModal.show('delete-ingredient-modal')
      this.deleteIngredientId = ingredientId
    },
    async handleIngredientDelete (bvModalEvt) {
      try {
        bvModalEvt.preventDefault()
        await this.$store.dispatch('ingredients/deleteIngredient', { vm: this, ingredientId: this.deleteIngredientId })
        this.deleteIngredientId = ''
        this.$bvModal.hide('delete-ingredient-modal')
      } catch (error) {
        this.$bvToast.toast('Ingredient Delete Error\n' + error, {
          title: 'Error',
          toaster: 'b-toaster-top-center',
          variant: 'danger',
          autoHideDelay: 3000
        })
      }
    },
    handleIngredientCancel (bvModalEvt) {
      bvModalEvt.preventDefault()
      this.deleteIngredientId = ''
      this.$nextTick(() => {
        this.$bvModal.hide('delete-ingredient-modal')
      })
    }
  }
}
</script>
