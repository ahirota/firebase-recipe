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
            <b-td v-if="editing.id !== ingredient.id">
              {{ ingredient.quantity }}
            </b-td>
            <b-td v-else>
              <b-form-input
                id="ingredient-quantity"
                v-model="editing.quantity"
                type="number"
                min="0"
                @keydown.native.enter="handleIngredientUpdate"
                @keydown.native.esc="resetEditIngredient"
              />
            </b-td>
            <b-td v-if="editing.id !== ingredient.id" class="text-right">
              <b-button v-b-tooltip.hover variant="primary" title="Edit Ingredient" @click="editIngredientQuantity(ingredient.id)">
                <b-icon-pencil-square />
              </b-button>
              <b-button v-b-tooltip.hover variant="danger" title="Remove Ingredient" @click="openDeleteIngredientModal(ingredient.id)">
                <b-icon-trash />
              </b-button>
            </b-td>
            <b-td v-else class="text-right">
              <b-button v-b-tooltip.hover variant="success" title="Update Ingredient" @click="editIngredientQuantity(ingredient.id)">
                <b-icon-check />
              </b-button>
              <b-button v-b-tooltip.hover variant="danger" title="Cancel Ingredient Update" @click="resetEditIngredient">
                <b-icon-x />
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
              <b-button v-b-tooltip.hover variant="success" title="Submit New Ingredient" @click="createIngredient">
                <b-icon-check />
              </b-button>
              <b-button v-b-tooltip.hover variant="danger" title="Reset New Ingredient" @click="resetNewIngredient">
                <b-icon-x />
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
  name: 'InventoryBlock',
  data () {
    return {
      newIngredient: {
        name: '',
        quantity: 0
      },
      editing: {
        id: '',
        name: '',
        quantity: 0
      },
      deleteIngredientId: ''
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
    resetNewIngredient () {
      this.newIngredient = { name: '', quantity: 0 }
    },
    resetEditIngredient () {
      this.editing = { id: '', name: '', quantity: 0 }
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

      if (this.$store.state.ingredients.ingredients.map(ing => ing.name.toLowerCase()).includes(this.newIngredient.name.toLowerCase())) {
        this.$bvToast.toast('Ingredient With Name: [' + this.newIngredient.name + '] already exists.', {
          title: 'ERROR',
          toaster: 'b-toaster-top-center',
          variant: 'danger',
          autoHideDelay: 3000
        })
        return
      }

      this.newIngredient.quantity = parseInt(this.newIngredient.quantity)

      const copy = JSON.parse(JSON.stringify(this.newIngredient))
      await this.$store.dispatch('ingredients/addIngredient', { vm: this, parameters: copy })
      this.newIngredient = {
        name: '',
        quantity: 0
      }
    },
    editIngredientQuantity (ingredientId) {
      if (this.editing.id && this.editing.id === ingredientId) {
        this.handleIngredientUpdate()
      } else {
        this.editing = JSON.parse(JSON.stringify(this.$store.state.ingredients.ingredients.find(ing => ing.id === ingredientId)))
      }
    },
    async handleIngredientUpdate () {
      try {
        const copy = JSON.parse(JSON.stringify(this.editing))
        await this.$store.dispatch('ingredients/editIngredient', { vm: this, docid: this.editing.id, parameters: copy })
        this.editing = {
          id: '',
          name: '',
          quantity: 0
        }
      } catch (error) {
        this.$bvToast.toast('Ingredient Update Error\n' + error, {
          title: 'Error',
          toaster: 'b-toaster-top-center',
          variant: 'danger',
          autoHideDelay: 3000
        })
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
