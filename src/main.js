/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'
import db from '@/plugins/firebase'
// Components
import App from './App.vue'
import { getAuth, onAuthStateChanged  } from "firebase/auth";
// Composables
import { createApp } from 'vue'

const auth = getAuth();
onAuthStateChanged(auth, (user) => {
    const app = createApp(App)
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/auth.user
      // get current user
      app.use({
        install: () => {
            app.config.globalProperties.$mainUser = user
        }
    })
    } else {
      // User is signed out
      // ...
    }
    

    registerPlugins(app)

    app.use(db)
    app.provide('message', 'testing this text')
    app.mount('#app')
  });

