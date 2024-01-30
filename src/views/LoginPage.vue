<template>
    <v-row no-gutters justify="center" align="center" class="bg-grey-lighten-4" style="height: 100vh;">
      <v-col md="5" cols="12">
        <v-card class="pa-4">
          <p class="text-h5 font-weight-bold mb-5">
            Welcome Back Radiologist!
          </p>
          <v-form ref="form" @submit.prevent="login">
            <v-text-field v-model="email" label="Enter your email" dense variant="outlined" :rules="emailRule" />
            <v-text-field v-model="password" label="Enter your password" dense variant="outlined" :rules="required" />
            <v-btn type="submit" color="blue" block class="text-capitalize" :loading="loading">
              login
            </v-btn>
          </v-form>
        </v-card>
      </v-col>
      <Snackbar
      :snackbar="response.isShow"
      :color="response.color"
      :text="response.text"
      @update-bool="updateSnackBar"
    />
    <v-dialog v-model="loading">
      <v-progress-circular indeterminate :size="66" :width="10" class="mx-auto"></v-progress-circular>
    </v-dialog>
    </v-row>
  </template>
  <script>
  import Snackbar from '@/components/SnackbarComponent.vue'
  import { signIn, 
    //createNewUser 
  } from '@/composables/data'
  import { useEmail, useRequired } from '../composables/rules'
  export default {
    components: {Snackbar},
    layout: 'auth',
    data: () => ({
      response: {
        isShow: false,
        color: "",
        text: "",
      },
      loading: false,
      email: '',
      password: '',
      emailRule: useEmail(),
      required: useRequired()
    }),
    // async mounted() {
    //   await createNewUser(this.$firestore, "trevismurithi@gmail.com", "12345678")
    // },
    methods: {
      async login () {
        const state = await this.$refs.form.validate()
        if (state.valid) {
          try {
            this.loading = true
            const res = await signIn(this.email,this.password)
            if(res.uid) {
              this.$router.push({name: 'Home'})
            }
          } catch (error) {
            //
          }
          this.loading = false
        }
      },
      updateSnackBar(e) {
      this.response = {
        isShow: e,
        color: "",
        text: "",
      };
    },
    }
  }
  </script>
  