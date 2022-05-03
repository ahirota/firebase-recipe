<template>
  <b-navbar class="navbar-wrap" toggleable="lg">
    <b-navbar-brand href="#">
      <NuxtLogo />
    </b-navbar-brand>

    <b-navbar-nav>
      <b-nav-item @click="$router.push('/')">
        Recipes
      </b-nav-item>
      <b-nav-item @click="$router.push('/inventory')">
        Inventory
      </b-nav-item>
    </b-navbar-nav>

    <div class="right-nav float-right ml-auto my-2 my-md-2">
      <b-input
        v-model="keywords"
        type="search"
        class="mr-1"
        placeholder="Search"
        @keydown.native.enter="updateSearchWord"
        @update="updateSearchWord"
      />
    </div>
  </b-navbar>
</template>

<script>
export default {
  name: 'NavigationBar',
  data () {
    return {
      keywords: ''
    }
  },
  methods: {
    async updateSearchWord () {
      await this.$store.commit('search/setSearchTerm', this.keywords)
    }
  }
}
</script>
