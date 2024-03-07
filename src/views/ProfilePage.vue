<script>
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import { useAppStore } from "@/store/app";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Snackbar from "@/components/SnackbarComponent.vue";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRequired } from "@/composables/rules";
export default {
  components: { Snackbar },
  data: () => ({
    store: useAppStore(),
    required: useRequired(),
    user: {},
    response: {
      isShow: false,
      color: "",
      text: "",
    },
    editor: null,
    editorBlocks: {
      blocks: [
        {
          type: "paragraph",
          data: {
            text: "Create your template here...",
          },
        },
      ],
    },
    files: null,
    loading: false,
    headerImage: "link",
    footerImage: "link",
  }),
  async mounted() {
    this.editor = new EditorJS({
      /**
       * Id of Element that should contain the Editor
       */
      holder: "editorjs",

      /**
       * Available Tools list.
       * Pass Tool's class or Settings object for each Tool you want to use
       */
      tools: {
        header: Header,
        list: List,
      },
    });
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
      }
    });
    setTimeout(() => {
      this.readDocument();
      this.loading = false;
    }, 3000);
  },
  methods: {
    renderEditor(data) {
      return this.editor.render(data);
    },
    async getCurrentUser(uid) {
      this.loading = true;
      const docRef = doc(this.$firestore, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        this.user = docSnap.data();
        this.user = { ...this.user, uid };
        if (this.user.header) {
          this.headerImage = this.user.header;
        }
        if (this.user.footer) {
          this.footerImage = this.user.footer;
        }
        this.store.setUser(this.user);
      } else {
        // docSnap.data() will be undefined in this case
      }
    },
    async uploadHeaderFooter() {
      const formState = await this.$refs.form.validate()
      if (formState.valid) {
        this.loading = true;
        this.uploadFiles("header", true, 0);
        this.uploadFiles("footer", false, 1);
      }
    },
    async updateProfile(user) {
      try {
        await setDoc(
          doc(this.$firestore, "users", this.user.uid),
          user
        );
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    },
    uploadFiles(name, state, index) {
      const storage = getStorage();
      const storageRef = ref(storage, name);

      // 'file' comes from the Blob or File API
      uploadBytes(storageRef, this.files[index]).then(() => {
        getDownloadURL(ref(storage, name))
          .then(async (url) => {
            if (state) {
              this.headerImage = url;
              await this.updateProfile({
                ...this.user,
                header: this.headerImage,
              });
            } else {
              this.footerImage = url;
              await this.updateProfile({
                ...this.user,
                footer: this.footerImage,
              });
            }
            this.loading = false;
          })
          .catch(() => {
            this.loading = false;
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
    async addRecord() {
      this.loading = true;
      const db = this.$firestore;
      const user = this.user;
      this.editor
        .save()
        .then(async (outputData) => {
          try {
            await setDoc(doc(db, "templates", user.uid), outputData);
            this.loading = false;
          } catch (e) {
            this.loading = false;
          }
        })
        .catch(() => {
          this.loading = false;
        });
    },
    async readDocument() {
      this.loading = true;
      const docRef = doc(
        this.$firestore,
        "templates",
        this.user.uid
      );
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        this.renderEditor(docSnap.data());
      } else {
        // docSnap.data() will be undefined in this case
        this.renderEditor(this.editorBlocks).then(() => {
          // save an empty array
        });
      }
    },
  },
};
</script>
<template>
  <v-row no-gutters class="pa-4">
    <v-col class="mt-4" md="4">
      <p>Header</p>
      <div class="d-flex" style="width: 100%">
        <div class="__cell_full__ text-center" style="width: 100%">
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
      <div class="d-flex" style="width: 100%">
        <div class="__cell_full__ text-center" style="width: 100%">
          <v-img
            :src="footerImage"
            :lazy-src="footerImage"
            width="100%"
            height="100"
            cover=""
          />
        </div>
      </div>
      <v-form ref="form" class="header_image mt-5">
        <v-file-input
          v-model="files"
          clearable
          density="compact"
          label="File input"
          variant="outlined"
          multiple
          :rules="[
            (val) => !!val || 'value is required',
            (val) => (!!val && val.length === 2) || '2 files required',
          ]"
        ></v-file-input>
      </v-form>
      <v-btn color="primary" class="text-capitalize" @click="uploadHeaderFooter" :loading="loading">upload</v-btn>
    </v-col>
    <v-col class="mt-4 pa-2 bg-grey-lighten-4" md="12">
      <v-row no-gutters justify="space-between">
        <p class="text-h5 font-weight-bold">
        Customise Template
      </p>
      <v-btn color="primary" class="text-capitalize" @click="addRecord">
        save
      </v-btn>
      </v-row>
      <div id="editorjs"></div>
    </v-col>
    <Snackbar
      :snackbar="response.isShow"
      :color="response.color"
      :text="response.text"
      @update-bool="updateSnackBar"
    />
    <v-dialog v-model="loading">
      <v-progress-circular
        indeterminate
        :size="66"
        :width="10"
        class="mx-auto"
      ></v-progress-circular>
    </v-dialog>
  </v-row>
</template>
