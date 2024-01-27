<template>
  <v-navigation-drawer v-model="drawer" color="grey-lighten-4">
    <v-list-item
      class="bg-blue-darken-4 py-3"
      title="Radiologist Application"
      :subtitle="store.user ? store.user.name : ''"
    ></v-list-item>
    <v-divider></v-divider>
    <v-list-item
      active-class="text-blue"
      link
      title="Home"
      to="/home"
      @click="router.push('/')"
    ></v-list-item>
    <v-list-item
      active-class="text-blue"
      link
      title="Reports"
      to="/reports"
      @click="router.push('/reports')"
    ></v-list-item>
    <v-list-item
      active-class="text-blue"
      link
      title="Archives"
      to="/archives"
      @click="router.push('/archives')"
    ></v-list-item>
    <v-list-item
      active-class="text-blue"
      link
      title="Profile"
      to="/profile"
      @click="router.push('/profile')"
    ></v-list-item>
  </v-navigation-drawer>
  <v-app-bar flat color="blue-darken-4">
    <v-app-bar-title>
      <v-icon icon="mdi-menu" @click="drawer=!drawer"/>
      Radiologist
    </v-app-bar-title>
    <v-spacer />
    <v-row no-gutters class="pr-5" align="center" justify="end">
      <div>
        <v-icon icon="mdi-account" />
        {{ store.user ? store.user.username : "" }}
      </div>
      <div class="ml-4 __cusor__" @click="signOutUser">Logout</div>
    </v-row>
  </v-app-bar>
</template>

<script setup>
import { useAppStore } from "@/store/app";
import { useRouter } from "vue-router";
import  { ref } from 'vue'
import { getAuth, signOut  } from "firebase/auth";

const store = useAppStore();
const router = useRouter();
const drawer = ref(false)

function signOutUser(){
  const auth = getAuth();
  signOut(auth).then(() => {
    store.setUser({})
    router.push('/auth/login')
  }).catch(console.log)
}
</script>
<style scoped>
.__cusor__{
  cursor: pointer;
}
</style>
