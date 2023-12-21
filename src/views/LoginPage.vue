<template>
    <v-row no-gutters justify="center" align="center" style="height: 100vh;">
      <v-col md="6" cols="12">
        <v-card class="pa-4">
          <p class="text-h5 font-weight-bold">
            Welcome Back!
          </p>
          <v-form ref="form" @submit.prevent="login">
            <v-text-field v-model="email" label="Enter your email" dense outlined :rules="emailRule" />
            <v-text-field v-model="password" label="Enter your password" dense outlined :rules="required" />
            <v-btn type="submit" color="blue" block class="text-capitalize">
              login
            </v-btn>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </template>
  <script>
  import { signIn, 
    //createNewUser 
  } from '@/composables/data'
  import { useEmail, useRequired } from '../composables/rules'
  export default {
    layout: 'auth',
    data: () => ({
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
            const res = await signIn(this.email,this.password)
            console.log('res: ', res)
            if(res.uid) {
              this.$router.push({name: 'Home'})
            }
          } catch (error) {
            //
            console.log('error', error)
          }
        }
      }
    }
  }
  </script>
  