<template>
  <b-navbar class="navbar-wrap" toggleable="lg">
    <b-navbar-brand href="#">
      <NuxtLogo />
    </b-navbar-brand>

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
