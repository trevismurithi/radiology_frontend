<script>
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Snackbar from "@/components/SnackbarComponent.vue";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useChecker } from "@/composables/utils";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useAppStore } from "@/store/app";
import edjHTML from 'editorjs-html'
export default {
  components: { Snackbar },
  data: () => ({
    pdfLink: 'http://localhost:4000/bucket/pdf',
    store: useAppStore(),
    user: {},
    url: "http://127.0.0.1:4200/dicom-web/studies",
    loading: false,
    response: {
      isShow: false,
      color: "",
      text: "",
    },
    editorBlocks: {
      blocks: [
        {
          type: "paragraph",
          data: {
            text: "Name:      Number:",
          },
        },
        {
          type: "paragraph",
          data: {
            text: "Age:      Gender:    Referring Doctor:",
          },
        },
        {
          type: "paragraph",
          data: {
            text: "MODALITY+STUDY",
          },
        },
        {
          type: "paragraph",
          data: {
            text: "CLINICAL HISTORY",
          },
        },
        {
          type: "paragraph",
          data: {
            text: "COMPARISSON",
          },
        },
        {
          type: "paragraph",
          data: {
            text: "FINDINGS",
          },
        },
        {
          type: "paragraph",
          data: {
            text: "CONCLUSION",
          },
        },
        {
          type: "paragraph",
          data: {
            text: "RADIOLOGIST+DATE+CONTACT",
          },
        },
      ],
    },
    fullNames: "",
    number: "",
    age: "",
    gender: "",
    referring: "",
    radiologist: "",
    record: {},
    editor: null,
    headerImage: "link",
    footerImage: "link",
    isShowActions: false,
    isEdit: false,
    query: ''
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
      }
    });
    if (this.$route.query) {
      this.readData(this.url + window.location.search);
      this.query = this.$route.query
      this.isEdit = this.query.collection?true:false
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
    setTimeout(() => {
      this.readDocument(this.query.collection?'archives':'records');
      this.loading = false;
    }, 3000);
  },
  methods: {
    openNewPath(path) {
      window.open(path, '_blank')
    },
    async getCurrentUser(uid) {
      this.loading = true;
      const docRef = doc(this.$firestore, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        this.user = { ...docSnap.data(), uid: docSnap.id };
        this.store.setUser(this.user);
        if (this.user.header) {
          this.headerImage = this.user.header;
        }
        if (this.user.footer) {
          this.footerImage = this.user.footer;
        }
      } else {
        // docSnap.data() will be undefined in this case
        // no such document
      }
    },
    renderEditor(data) {
      return this.editor.render(data);
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
    async readDocument(collection = 'records') {
      this.loading = true;
      const docRef = doc(
        this.$firestore,
        collection,
        this.$route.query.StudyInstanceUID
      );
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        this.renderEditor(docSnap.data().data);
        this.referring = docSnap.data().user.name;
        if (this.$mainUser.uid === docSnap.data().user.uid){
          this.isShowActions = true
        }else {
          this.isShowActions = false
        }
      } else {
        // docSnap.data() will be undefined in this case
        this.isShowActions = true
        const template = await this.readTemplate()
        this.renderEditor(template?template:{})
        // .then(() => {
        //   // save an empty array
        //   this.addRecord(true)
        // });
      }
    },
    async readTemplate() {
      const docRef = doc(
        this.$firestore,
        "templates",
        this.user.uid
      );
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data()
      } else {
        // docSnap.data() will be undefined in this case
        return null
      }
    },
    async addRecord(pending = false) {
      this.loading = true;
      const db = this.$firestore;
      const studyID = this.$route.query.StudyInstanceUID;
      const user = this.user;
      this.editor
        .save()
        .then(async (outputData) => {
          try {
            await setDoc(doc(db, "records", studyID), {
              pending,
              data: outputData,
              user,
            });
            if(pending) {
              this.isEdit = true
            }else {
              this.isEdit = false
            }
            this.loading = false;
            this.response = {
              color: 'bg-green',
              text: 'Successful',
              isShow:  true
            }
          } catch (e) {
            this.loading = false;
            this.response = {
              color: 'bg-red',
              text: 'Error adding document',
              isShow:  true
            }
          }
        })
        .catch(() => {
          this.loading = false;
          this.response = {
              color: 'bg-red',
              text: 'Adding Document failed',
              isShow:  true
            }
        });
    },
    async addArchive() {
      this.loading = true;
      const db = this.$firestore;
      const studyID = this.$route.query.StudyInstanceUID;
      const user = this.user;
      this.editor
        .save()
        .then(async (outputData) => {
          try {
            await setDoc(doc(db, "archives", studyID), {
              data: outputData,
              user,
            });
            this.loading = false;
            this.response = {
              color: 'bg-green',
              text: 'Saved report to archive',
              isShow:  true
            }
          } catch (e) {
            this.loading = false;
            this.response = {
              color: 'bg-red',
              text: 'Failed to Save to archive',
              isShow:  true
            }
          }
        })
        .catch((error) => {
          this.loading = false;
          this.response = {
              color: 'bg-red',
              text: 'report failed to save' + error.message,
              isShow:  true
            }
        });
    },
    async generateUrl () {
      this.loading = true;
      this.editor
        .save()
        .then(async (outputData) => {
          try {
            const edjsParser = edjHTML()
            const study = edjsParser.parse(outputData)
            study.splice(0, 0, `<img src="${this.headerImage}" width="100%"/>`)
            study.push(`<img src="${this.footerImage}" width="100%" />`)
            await fetch(this.pdfLink + '/' + this.$route.query.StudyInstanceUID, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                study
              })
            })
            // window.open(this.pdfLink)
            this.loading = false;
            this.response = {
              color: 'bg-green',
              text: 'pdf link was generated successfully',
              isShow:  true
            }
          } catch (e) {
            this.loading = false;
            this.response = {
              color: 'bg-red',
              text: 'document not saved. Try again',
              isShow:  true
            }
          }
        })
        .catch((error) => {
          this.loading = false;
          this.response = {
              color: 'bg-red',
              text: 'Failed to get document. Try again' + error.message,
              isShow:  true
            }
        });
    }
  },
};
</script>
<template>
  <v-row no-gutters class="bg-grey-lighten-4">
    <v-col md="10" xl="8" class="pa-2 mx-auto bg-white">
      <div>
        <v-row no-gutters justify="space-between">
          <v-btn class="my-3 text-capitalize" color="primary" variant="flat" @click="openNewPath(`http://localhost:4000/bucket/pdf/${query.StudyInstanceUID}`)">
                View Pdf
              </v-btn>
          <v-menu v-if="isShowActions">
            <template v-slot:activator="{ props }">
              <v-btn class="my-3 text-capitalize" color="primary" variant="flat" v-bind="props">
                Actions
              </v-btn>
            </template>
            <v-list class="__cursor__">
              <v-list-item v-if="!isEdit" @click="addRecord(true)">
                <v-list-item-title>Edit Report</v-list-item-title>
              </v-list-item>
              <v-list-item v-if="isEdit && !query.collection" @click="addRecord(false)">
                <v-list-item-title>Save Report</v-list-item-title>
              </v-list-item>
              <v-list-item v-if="!query.collection" @click="generateUrl">
                <v-list-item-title>Generate PDF</v-list-item-title>
              </v-list-item>
              <v-list-item v-if="isEdit" @click="addArchive">
                <v-list-item-title>Save Archive</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
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
    <v-dialog v-model="loading" persistent>
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
.__cursor__{
  cursor: pointer;
}
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
