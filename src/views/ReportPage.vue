<script>
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Snackbar from "@/components/SnackbarComponent.vue";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useChecker } from "@/composables/utils";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {useAppStore} from '@/store/app'
export default {
  components: { Snackbar },
  data: () => ({
    store: useAppStore(),
    user: {},
    url: "https://raccoon.dicom.org.tw:443/dicom-web/studies",
    loading: false,
    response: {
      isShow: false,
      color: "",
      text: "",
    },
    editorBlocks: {
      blocks: [
                        {
                            type: 'paragraph',
                            data: {
                                text: 'Name:      Number:',
                            }
                        },
                        {
                            type: 'paragraph',
                            data: {
                                text: 'Age:      Gender:    Referring Doctor:',
                            }
                        },
                        {
                            type: 'paragraph',
                            data: {
                                text: 'MODALITY+STUDY',
                            }
                        },
                        {
                            type: 'paragraph',
                            data: {
                                text: 'CLINICAL HISTORY',
                            }
                        },
                        {
                            type: 'paragraph',
                            data: {
                                text: 'COMPARISSON',
                            }
                        },
                        {
                            type: 'paragraph',
                            data: {
                                text: 'FINDINGS',
                            }
                        },
                        {
                            type: 'paragraph',
                            data: {
                                text: 'CONCLUSION',
                            }
                        },
                        {
                            type: 'paragraph',
                            data: {
                                text: 'RADIOLOGIST+DATE+CONTACT',
                            }
                        }
                    ]
    },
    fullNames: "",
    number: "",
    age: "",
    gender: "",
    referring: "",
    radiologist: "",
    record: {},
    editor: null,
    headerImage: 'link',
    footerImage: 'link'
  }),
  mounted() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        const uid = user.uid;
        // get current user
        this.getCurrentUser(uid);
      } else {
        // User is signed out
        // ...
        console.log("auth.currentUser: N/A");
      }
    });
    console.log("this.$firestore: ", this.$firestore);
    if (this.$route.query) {
      console.log("this.$route.query: ", window.location.search);
      this.readData(this.url + window.location.search);
    }
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
    console.log(this.editor);
    setTimeout(() => {
      this.readDocument();
      this.loading = false;
    }, 10000);
  },
  methods: {
    async getCurrentUser(uid) {
      this.loading = true;
      const docRef = doc(this.$firestore, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        this.user = {...docSnap.data(), uid: docSnap.id};
        console.log("Current User data:", this.user);
        this.store.setUser(this.user);
        if(this.user.header) {
          this.headerImage = this.user.header
        }
        if(this.user.footer) {
          this.footerImage = this.user.footer
        }
      } else {
        // docSnap.data() will be undefined in this case
        console.log("No such document!");
      }
    },
    renderEditor(data) {
      this.editor.render(data);
    },
    async readData(url) {
      try {
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        const data = await res.json();
        this.fullNames = useChecker(data[0]["00100010"]);
        this.number = useChecker(data[0]["00100020"]);
      } catch (e) {
        console.log("errorReadData: ", e);
        this.response.isShow = true;
        this.response.text = "record not found";
        this.response.color = "bg-red";
      }
    },
    checkForNameIn(data) {
      return useChecker(data);
    },
    updateSnackBar(e) {
      this.response = {
        isShow: e,
        color: "",
        text: "",
      };
    },
    async readDocument() {
      this.loading = true;
      const docRef = doc(
        this.$firestore,
        "records",
        this.$route.query.StudyInstanceUID
      );
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
        this.renderEditor(docSnap.data().data);
        this.referring = docSnap.data().user.name
      } else {
        // docSnap.data() will be undefined in this case
        console.log("No such document!");
        this.editorBlocks.blocks[0].data.text = `Name: ${this.fullNames}  Number: ${this.number}`
        this.editorBlocks.blocks[1].data.text = `Age: 34   Gender: Male  Referring Doctor: ${this.user.name}`
        this.renderEditor(this.editorBlocks)
      }
    },
    async addRecord() {
      this.loading = true;
      const db = this.$firestore;
      const studyID = this.$route.query.StudyInstanceUID;
      const user = this.user;
      this.editor
        .save()
        .then(async (outputData) =>{
          try {
            const docRef = await setDoc(doc(db, "records", studyID), {
              data: outputData,
              user
            });
            console.log("Document written with ID: ", docRef);
            this.loading = false;
          } catch (e) {
            console.error("Error adding document: ", e);
            this.loading = false;
          }
        })
        .catch((error) => {
          console.log("addRecordError: ", error);
          this.loading = false;
        });
    },
  },
};
</script>
<template>
  <v-row no-gutters class="bg-grey-lighten-4">
    <v-col md="10" xl="8" class="pa-2 mx-auto bg-white">
      <div>
        <v-row no-gutters justify="end">
          <v-btn
            class="my-3 mx-4 text-capitalize"
            elevation="0"
            variant="flat"
            color="primary"
            @click="addRecord"
          >
            Save
          </v-btn>
          <v-btn
            v-if="false"
            class="my-3 text-capitalize"
            elevation="0"
            variant="flat"
            color="primary"
            @click.prevent=""
          >
            Dispatch
          </v-btn>
        </v-row>
        <div>
          <div class="d-flex">
            <div class="__cell_full__ text-center">
              <v-img
              :src="headerImage"
                :lazy-src="headerImage"
                width="100%"
                height="100"
                cover=""
              />
            </div>
          </div>
          <div id="editorjs"></div>
          <div class="d-flex">
            <div class="__cell_full__ text-center">
              <v-img
                :src="footerImage"
                :lazy-src="footerImage"
                width="100%"
                height="100"
                cover=""
              />
            </div>
          </div>
        </div>
      </div>
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
<style>
.__cell__50 {
  border: 1px solid rgb(0, 0, 0);
  margin: 0;
  width: 50%;
  padding: 8px 10px;
}
.__cell__ {
  border: 1px solid rgb(0, 0, 0);
  margin: 0;
  width: 33.35%;
  padding: 8px 10px;
}
.__cell_full__ {
  border: 1px solid rgb(0, 0, 0);
  margin: 0;
  width: 100%;
  padding: 8px 10px;
}
</style>
