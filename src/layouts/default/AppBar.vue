<template>
  <v-navigation-drawer>
    <v-list-item
      title="Radiologist Application"
      :subtitle="store.user ? store.user.name : ''"
    ></v-list-item>
    <v-divider></v-divider>
    <v-list-item
      link
      title="Home Page"
      to=""
      @click="router.push('/')"
    ></v-list-item>
    <v-list-item
      link
      title="Profile Page"
      to="/profile"
      @click="router.push('/profile')"
    ></v-list-item>
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
        {{ store.user ? store.user.username : "" }}
      </div>
      <div class="ml-4 __cusor__" @click="signOutUser">Logout</div>
    </v-row>
  </v-app-bar>
</template>

<script setup>
import { useAppStore } from "@/store/app";
import { useRouter } from "vue-router";
import { getAuth, signOut  } from "firebase/auth";

const store = useAppStore();
const router = useRouter();

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
