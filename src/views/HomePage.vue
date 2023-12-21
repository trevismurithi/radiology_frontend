<script>
import { orderByField } from '@/composables/search'
import { useChecker } from "@/composables/utils";
import Snackbar from '@/components/SnackbarComponent.vue'
import { doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged  } from "firebase/auth";
import {useAppStore} from '@/store/app'
export default {
  components: {Snackbar},
  data() {
    return {
      store: useAppStore(),
      user: {},
      reverse: false,
      orderSelected: '',
      response: {
        isShow: false,
        color: "",
        text: "",
      },
      loading: false,
      url: "https://raccoon.dicom.org.tw:443/dicom-web/studies",
      page: 1,
      headers: [
        {
          text: "STATUS",
          align: "start",
          sortable: false,
          value: "status",
        },
        { text: "NAME", value: "00100010" },
        { text: "AGE", value: "age" },
        { text: "GENDER", value: "gender" },
        { text: "NUMBER", value: "number" },
        { text: "MODALITY", value: "modality" },
        { text: "STUDY", value: "study" },
        { text: "PERFORMED BY", value: "performed" },
      ],
      actions: [
        {
          title: "Open Study",
        },
        {
          path: "http://localhost:8080/search/html/report.html",
          title: "Open Report",
        },
      ],
      dataList: [],
      patientID: "",
      patientName: "",
      StudyDateFrom: null,
      StudyDateTo: null,
      identifier: "",
      modality: "",
    };
  },
  computed: {
    smallDevice() {
      return this.$vuetify.breakpoint.smAndDown;
    },
    largeDevice() {
      return this.$vuetify.breakpoint.mdAndUp;
    },
  },
  async mounted() {
    // read user
    const auth = getAuth();
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/auth.user
    const uid = user.uid;
    // get current user
    this.getCurrentUser(uid)
  } else {
    // User is signed out
    // ...
    console.log('auth.currentUser: N/A')
  }
});
    await this.readData(this.url);
  },
  methods: {
    async getCurrentUser(uid) {
      this.loading = true;
      const docRef = doc(this.$firestore, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log("Current User data:", docSnap.data());
        this.user = docSnap.data()
        this.store.setUser(this.user)
      } else {
        // docSnap.data() will be undefined in this case
        console.log("No such document!");
      }
    },
    orderData(key){
      this.orderSelected = key
      orderByField(key, this.dataList, this.reverse)
    },
    copyText(i, value) {
      let path = "";
      if (i === 1) {
        path = "?StudyInstanceUID=" + value;
      } else {
        path = "?StudyInstanceUID=" + value;
      }
      const url = "http://localhost:8080/bluelight/html/start.html" + path;
      navigator.clipboard.writeText(url);
    },
    openNewPath(i, value) {
      if (i === 1) {
        const path = "?StudyInstanceUID=" + value;
        window.open(
          "http://localhost:8080/bluelight/html/start.html" + path,
          "_blank"
        );
      } else {
        const path =
          "?StudyInstanceUID=" + value ;
          this.$router.push("/report" + path)
      }
    },
    checkForNameIn(data) {
      return useChecker(data);
    },
    getColor(calories) {
      if (calories > 400) {
        return "red";
      } else if (calories > 200) {
        return "orange";
      } else {
        return "green";
      }
    },
    async filterData() {
      let query = "?";
      if (this.patientID.length) {
        query = query + `PatientID=${encodeURI(this.patientID)}`;
      }
      if (this.patientName.length) {
        query = query + `&PatientName=${encodeURI(this.patientName)}`;
      }
      // if (this.StudyDateFrom.length) {
      //   query = query + `&StudyDate=${encodeURI(this.StudyDate)}`;
      // }
      if (this.identifier.length) {
        query = query + `&AccessionNumber=${encodeURI(this.identifier)}`;
      }
      if (this.modality.length) {
        query = query + `&ModalitiesInStudy=${encodeURI(this.modality)}`;
      }
      await this.readData(this.url + query);
    },
    async readData(url = this.url) {
      this.loading = true
      try{
        const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      const data = await res.json();
      this.dataList = data;
      }catch(e) {
        console.log('errorReadData: ', e)
        this.response.isShow = true
        this.response.text = 'record not found'
        this.response.color = 'bg-red'
      }
      this.loading = false
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
  <v-row no-gutters>
    <v-col cols="12">
      {{ store }}
      <v-row v-if="false" no-gutters class="my-2" justify="end">
        <div class="d-flex">
          <div style="width:200px">
            <v-text-field
                  v-model="StudyDateFrom"
                  type="date"
                  density="compact"
                  hide-details
                  variant="plain"
                  label="From Date"
                />
          </div>
          <div class="ml-5" style="width:200px">
            <v-text-field
                  v-model="StudyDateTo"
                  type="date"
                  density="compact"
                  hide-details
                  variant="plain"
                  label="To Date"
                />
          </div>
        </div>
      </v-row>
      <v-table>
        <template #default>
          <thead>
            <tr>
                <th class="text-left">
                  Patient ID
                  <v-icon :color="orderSelected==='00100020'?'primary':'black'" @click="orderData('00100020', reverse =!reverse)">
                    mdi-arrow-up-down-bold
                  </v-icon>
                </th>
              <th class="text-left">
                Patient Name
                <v-icon :color="orderSelected==='00100010'?'primary':'black'" @click="orderData('00100010', reverse =!reverse)">
                    mdi-arrow-up-down-bold
                  </v-icon>
              </th>
              <th class="text-left">
                Study Date
                <v-icon :color="orderSelected==='00080020'?'primary':'black'" @click="orderData('00080020', reverse =!reverse)">
                    mdi-arrow-up-down-bold
                  </v-icon>
              </th>
              <th class="text-left">
                Identifier
                <v-icon :color="orderSelected==='00080050'?'primary':'black'" @click="orderData('00080050', reverse =!reverse)">
                    mdi-arrow-up-down-bold
                  </v-icon>
              </th>
              <th class="text-left">
                Modality
                <v-icon :color="orderSelected==='00080061'?'primary':'black'" @click="orderData('00080061', reverse =!reverse)">
                    mdi-arrow-up-down-bold
                  </v-icon>
              </th>
              <th>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <v-text-field
                  v-model="patientID"
                  density="compact"
                  hide-details
                  variant="plain"
                  label="search id"
                />
              </td>
              <td>
                <v-text-field
                  v-model="patientName"
                  density="compact"
                  hide-details
                  variant="plain"
                  label="search name"
                />
              </td>
              <td>
                N/A
              </td>
              <td>
                <v-text-field
                  v-model="identifier"
                  density="compact"
                  hide-details
                  variant="plain"
                  label="search identifier"
                />
              </td>
              <td>
                <v-text-field
                  v-model="modality"
                  density="compact"
                  hide-details
                  variant="plain"
                  label="search modality"
                />
              </td>
              <td>
                <v-btn
                  color="primary"
                  class="text-capitalize"
                  @click="filterData"
                  >search</v-btn
                >
              </td>
            </tr>
            <tr v-for="(data, i) in dataList" :key="i">
              <td>{{ checkForNameIn(data["00100020"]) }}</td>
              <td>{{ checkForNameIn(data["00100010"]) }}</td>
              <td>{{ checkForNameIn(data["00080020"]) }}</td>
              <td>{{ checkForNameIn(data["00080050"]) }}</td>
              <td>{{ checkForNameIn(data["00080061"]) }}</td>
              <td>
                <v-btn color="primary" class="text-capitalize">
                  More
                  <v-menu activator="parent">
                    <v-list>
                      <v-list-item
                        v-for="(item, index) in actions"
                        :key="index"
                        @click="
                          openNewPath(
                            i + 1,
                            checkForNameIn(data['0020000D']),
                          )
                        "
                      >
                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item
                        @click="
                          copyText(i + 1, checkForNameIn(data['0020000D']))
                        "
                      >
                        <v-list-item-title>Copy Link</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </template>
      </v-table>
      <v-pagination v-model="page" :length="6" />
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
