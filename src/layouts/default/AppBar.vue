<template>
<v-navigation-drawer>
  <v-list-item title="Radiologist Application" subtitle="Joseph Andrew"></v-list-item>
  <v-divider></v-divider>
  <v-list-item link title="Home Page" to=""></v-list-item>
  <v-list-item link title="Profile Page"></v-list-item>
</v-navigation-drawer>
  <v-app-bar flat>
    <v-app-bar-title>
      <v-icon icon="mdi-menu" />
      Radiologist
    </v-app-bar-title>
    <v-spacer />
    <v-row no-gutters class="pr-5" align="center" justify="end">
      <div>
      <v-icon icon="mdi-account" />
      {{ store.user?store.user.username:'' }}
    </div>
    <div class="ml-4">
      Logout
    </div>  
    </v-row> 
  </v-app-bar>
</template>

<script setup>
import {useAppStore} from '@/store/app'
const store = useAppStore()
</script>
