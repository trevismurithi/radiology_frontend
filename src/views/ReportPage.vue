<script>
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Snackbar from "@/components/SnackbarComponent.vue";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useChecker } from "@/composables/utils";
export default {
  components: { Snackbar },
  data: () => ({
    url: "https://raccoon.dicom.org.tw:443/dicom-web/studies",
    loading: false,
    response: {
      isShow: false,
      color: "",
      text: "",
    },
    fullNames: "",
    number: "",
    age: "",
    gender: "",
    referring: "",
    radiologist: "",
    record: {},
    editor: null,
  }),
  mounted() {
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
    this.loading = true;
    setTimeout(() => {
      this.readDocument()
      this.loading = false;
    }, 10000);
  },
  methods: {
    renderEditor(data) {
      this.editor.render(data);
    },
    async readData(url) {
      this.loading = true;
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
      this.loading = false;
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
      const docRef = doc(this.$firestore, "records", this.$route.query.StudyInstanceUID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
        this.renderEditor(docSnap.data());
      } else {
        // docSnap.data() will be undefined in this case
        console.log("No such document!");
      }
    },
    async addRecord() {
      this.loading = true;
      const db = this.$firestore;
      const studyID = this.$route.query.StudyInstanceUID;
      this.editor
        .save()
        .then(async function (outputData) {
          try {
            const docRef = await setDoc(
              doc(db, "records", studyID),
              outputData
            );
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
  <v-row no-gutters>
    <v-col class="pa-2">
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
                src="https://png.pngtree.com/thumb_back/fh260/background/20210828/pngtree-rectangle-diagonal-cut-white-lines-yellow-background-image_765017.jpg"
                lazy-src="https://png.pngtree.com/thumb_back/fh260/background/20210828/pngtree-rectangle-diagonal-cut-white-lines-yellow-background-image_765017.jpg"
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
                src="https://png.pngtree.com/thumb_back/fh260/background/20210828/pngtree-rectangle-diagonal-cut-white-lines-yellow-background-image_765017.jpg"
                lazy-src="https://png.pngtree.com/thumb_back/fh260/background/20210828/pngtree-rectangle-diagonal-cut-white-lines-yellow-background-image_765017.jpg"
                width="100%"
                height="100"
                cover=""
              />
            </div>
          </div>
        </div>
      </div>
    </v-col>
    <v-col class="px-2 pt-5">
      <div>
        <div class="d-flex">
          <div class="__cell_full__ text-center">
            HEADER
          </div>
        </div>
        <div class="d-flex">
          <div class="__cell__50">
            Name: {{ fullNames }}
          </div>
          <div class="__cell__50">
            Number: {{ number }}
          </div>
        </div>
        <div class="d-flex">
          <div class="__cell__">
            AGE: {{ age }}
          </div>
          <div class="__cell__">
            GENDER {{ gender }}
          </div>
          <div class="__cell__">
            REFERRING DOCTOR: {{ referring }}
          </div>
        </div>        
        <div class="d-flex">
          <div class="__cell_full__ text-center">
            FOOTER
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
