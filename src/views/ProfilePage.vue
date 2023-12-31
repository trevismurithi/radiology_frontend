<script>
import { useAppStore } from "@/store/app";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Snackbar from '@/components/SnackbarComponent.vue'
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
export default {
  components: {Snackbar},
  data: () => ({
    store: useAppStore(),
    user: {},
    response: {
        isShow: false,
        color: "",
        text: "",
      },
    files: null,
    loading: false,
    headerImage: 'link',
    footerImage: 'link'
  }),
  async mounted() {
    // read user
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        const uid = user.uid;
        // get current user
        await this.getCurrentUser(uid);
        this.loading = false;
      } else {
        // User is signed out
        // ...
        console.log("auth.currentUser: N/A");
      }
    });
  },
  methods: {
    async getCurrentUser(uid) {
      this.loading = true;
      const docRef = doc(this.$firestore, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log("Current User data:", docSnap.data());
        this.user = docSnap.data();
        this.user = {...this.user, uid}
        if(this.user.header) {
          this.headerImage = this.user.header
        }
        if(this.user.footer) {
          this.footerImage = this.user.footer
        }
        this.store.setUser(this.user);
      } else {
        // docSnap.data() will be undefined in this case
        console.log("No such document!");
      }
    },
    async uploadHeaderFooter() {
      this.loading = true
      this.uploadFiles('header', true, 0)
      this.uploadFiles('footer', false, 1)
    },
    async updateProfile(user) {
        try {
          const docRef = await setDoc(
            doc(this.$firestore, "users", this.user.uid), user);
          console.log("Document written with ID: ", docRef);
        } catch (e) {
          console.error("Error adding document: ", e);
        }
    },
    uploadFiles(name, state, index) {
      const storage = getStorage();
      const storageRef = ref(storage, name);

      // 'file' comes from the Blob or File API
      uploadBytes(storageRef, this.files[index]).then((snapshot) => {
        console.log("Uploaded a blob or file!", snapshot);
        getDownloadURL(ref(storage, name))
          .then(async (url) => {
            console.log("Uploaded a blob or file!", url);
            if(state) {
              this.headerImage = url
              await this.updateProfile({...this.user, header: this.headerImage})
            }else{
              this.footerImage = url
              await this.updateProfile({...this.user, footer: this.footerImage})
            }
            this.loading = false
          })
          .catch((error) => {
            console.log('uploadfiles: ', error)
            this.loading = false
          });
      });
    },
    updateSnackBar(e) {
      this.response = {
        isShow: e,
        color: "",
        text: "",
      };
    },
  },
};
</script>
<template>
  <v-row no-gutters class="pa-4">
    <v-col class="mt-4" cols="12">
      <p>Header</p>
      <div class="d-flex" style="width: 100%;">
        <div class="__cell_full__ text-center" style="width: 100%;">
          <v-img
          :src="headerImage"
            :lazy-src="headerImage"
            width="100%"
            height="100px"
            cover=""
          />
        </div>
      </div>
      <p>Footer</p>
      <div class="d-flex" style="width: 100%;">
        <div class="__cell_full__ text-center" style="width: 100%;">
          <v-img
            :src="footerImage"
            :lazy-src="footerImage"
            width="100%"
            height="100"
            cover=""
          />
        </div>
      </div>
      <div class="header_image mt-5">
        <v-file-input
          v-model="files"
          clearable
          density="compact"
          label="File input"
          variant="outlined"
          multiple
        ></v-file-input>
      </div>
      <v-btn @click="uploadHeaderFooter" :loading="loading">upload</v-btn>
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
