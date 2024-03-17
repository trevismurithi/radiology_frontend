<script>
import { orderByField } from "@/composables/search";
import { useChecker } from "@/composables/utils";
import Snackbar from "@/components/SnackbarComponent.vue";
import { doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useAppStore } from "@/store/app";
export default {
  components: { Snackbar },
  data() {
    return {
      seriesDialog: false,
      store: useAppStore(),
      seriesList: [],
      user: {},
      reverse: false,
      orderSelected: "",
      response: {
        isShow: false,
        color: "",
        text: "",
      },
      loading: false,
      url: `${process.env.VITE_ORTHANC_URL}dicom-web/studies`,
      series: `${process.env.VITE_ORTHANC_URL}dicom-web/studies/`,
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
        this.getCurrentUser(uid);
      } else {
        // User is signed out
        // ...
      }
    });
    await this.readData(this.url);
  },
  methods: {
    arrangeDate(time) {
      const date = String(time)
      return `${date.substring(0,4)}/${date.substring(4,6)}/${date.substring(6,8)}`
    },
    async getCurrentUser(uid) {
      this.loading = true;
      const docRef = doc(this.$firestore, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        this.user = docSnap.data();
        this.store.setUser(this.user);
      } else {
        // docSnap.data() will be undefined in this case
      }
    },
    orderData(key) {
      this.orderSelected = key;
      orderByField(key, this.dataList, this.reverse);
    },
    copyText(value) {
      const url = `${process.env.VITE_OHIF_URL}${value}/ohif-dicom-json`;
      navigator.clipboard.writeText(url);
      this.response.isShow = true;
      this.response.color = "bg-grey";
      this.response.text = "copied";
    },
    openNewPath(value, state=true) {
      if(state){
        window.open(`${process.env.VITE_OHIF_URL}${value}/ohif-dicom-json`, '_blank');
      }else {
        window.open(`${process.env.VITE_BASE_URL}${value}`, '_blank');
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
      this.loading = true;
        Promise.allSettled([
          fetch(`${process.env.VITE_ORTHANC_URL}studies`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }),
          fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          })
        ]).then(async(results) => {
          if (results[0].status === "fulfilled" && results[1].status === "fulfilled") {
            const studies = await results[0].value.json()
            const dcom = await results[1].value.json()
            this.dataList = dcom.map((com, index) => ({...com, study: studies[index]}));
            // console.log('studies+dcom: ', this.dataList)
          }
          this.loading = false;
          
        }).catch((err) => {
          this.response.isShow = true;
        this.response.text = err.message;
        this.response.color = "bg-red";
        this.loading = false;
        })
    },
    updateSnackBar(e) {
      this.response = {
        isShow: e,
        color: "",
        text: "",
      };
    },
    async fetchSeries(studyID) {
      try {
        const res = await fetch(this.series + studyID + "/series", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        this.seriesList = await res.json();
        this.seriesDialog = true;
      } catch (e) {
        //
      }
    },
  },
};
</script>

<template>
  <v-row no-gutters class="bg-grey-lighten-4">
    <v-col cols="12">
      <v-row v-if="false" no-gutters class="my-2" justify="end">
        <div class="d-flex">
          <div style="width: 200px">
            <v-text-field v-model="StudyDateFrom" type="date" density="compact" hide-details variant="plain"
              label="From Date" />
          </div>
          <div class="ml-5" style="width: 200px">
            <v-text-field v-model="StudyDateTo" type="date" density="compact" hide-details variant="plain"
              label="To Date" />
          </div>
        </div>
      </v-row>
      <v-table>
        <template #default>
          <thead>
            <tr>
              <th class="text-left">
                Patient ID
                <v-icon :color="orderSelected === '00100020' ? 'primary' : 'black'"
                  @click="orderData('00100020', (reverse = !reverse))">
                  mdi-arrow-up-down-bold
                </v-icon>
              </th>
              <th class="text-left">
                Patient Name
                <v-icon :color="orderSelected === '00100010' ? 'primary' : 'black'"
                  @click="orderData('00100010', (reverse = !reverse))">
                  mdi-arrow-up-down-bold
                </v-icon>
              </th>
              <th class="text-left">
                Study ID
                <v-icon :color="orderSelected === '00200010' ? 'primary' : 'black'"
                  @click="orderData('00200010', (reverse = !reverse))">
                  mdi-arrow-up-down-bold
                </v-icon>
              </th>
              <th class="text-left">
                Study Date
                <v-icon :color="orderSelected === '00080020' ? 'primary' : 'black'"
                  @click="orderData('00080020', (reverse = !reverse))">
                  mdi-arrow-up-down-bold
                </v-icon>
              </th>
              <th class="text-left">
                Modality
                <v-icon :color="orderSelected === '00080061' ? 'primary' : 'black'"
                  @click="orderData('00080061', (reverse = !reverse))">
                  mdi-arrow-up-down-bold
                </v-icon>
              </th>
              <th class="text-left">
                Identifier
                <v-icon :color="orderSelected === '00080050' ? 'primary' : 'black'"
                  @click="orderData('00080050', (reverse = !reverse))">
                  mdi-arrow-up-down-bold
                </v-icon>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <v-text-field v-model="patientID" density="compact" hide-details variant="plain" label="search id" />
              </td>
              <td>
                <v-text-field v-model="patientName" density="compact" hide-details variant="plain"
                  label="search name" />
              </td>
              <td>N/A</td>
              <td>N/A</td>
              <td>
                <v-text-field v-model="modality" density="compact" hide-details variant="plain"
                  label="search modality" />
              </td>
              <td>
                <v-text-field v-model="identifier" density="compact" hide-details variant="plain"
                  label="search identifier" />
              </td>
              <td>
                <v-btn color="blue-darken-2" variant="flat" class="text-capitalize" @click="filterData">search</v-btn>
              </td>
            </tr>
            <tr v-for="(data, i) in dataList" :key="i">
              <td>{{ checkForNameIn(data["00100020"]) }}</td>
              <td>{{ checkForNameIn(data["00100010"]) }}</td>
              <td>{{ checkForNameIn(data["00200010"]) }}</td>
              <td>{{ arrangeDate(checkForNameIn(data["00080020"])) }}</td>
              <td>{{ checkForNameIn(data["00080061"]) }}</td>
              <td>{{ checkForNameIn(data["00080050"]) }}</td>
              <td>
                <v-btn color="primary" variant="plain" class="text-capitalize">
                  More
                  <v-menu activator="parent">
                    <v-list>
                      <v-list-item @click="openNewPath(data['study'])">
                        <v-list-item-title> View Study </v-list-item-title>
                      </v-list-item>
                      <v-list-item v-for="(item, index) in actions" :key="index" @click="
        openNewPath('report?StudyInstanceUID='+checkForNameIn(data['0020000D']), false)
        ">
                        <v-list-item-title>Open Report</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="
        copyText(data['study'])
        ">
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
      <!-- <v-pagination v-model="page" :length="6" /> -->
    </v-col>
    <Snackbar :snackbar="response.isShow" :color="response.color" :text="response.text" @update-bool="updateSnackBar" />
    <v-dialog v-model="loading">
      <v-progress-circular indeterminate :size="66" :width="10" class="mx-auto"></v-progress-circular>
    </v-dialog>
    <v-dialog v-model="seriesDialog" width="80%" persistent>
      <v-card class="pa-4">
        <v-row no-gutters justify="end">
          <v-icon @click="seriesDialog = false"> mdi-close </v-icon>
        </v-row>
        <v-table>

          <template #default>
            <thead>
              <tr>
                <th class="left">Patient ID</th>
                <th class="left">Patient Name</th>
                <th class="left">Study Date</th>
                <th class="left">Identifier</th>
                <th class="left">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(data, i) in seriesList" :key="i">
                <td>{{ checkForNameIn(data["00100020"]) }}</td>
                <td>{{ checkForNameIn(data["00100010"]) }}</td>
                <td>{{ checkForNameIn(data["00080020"]) }}</td>
                <td>{{ checkForNameIn(data["00080050"]) }}</td>
                <td>
                  <v-btn variant="flat" class="text-capitalize text-blue" append-icon="mdi-arrow-right" @click="
        $router.push(
          `/dicomweb?studyUID=${checkForNameIn(
            data['0020000D']
          )}&seriesUID=${checkForNameIn(data['0020000E'])}`
        )
        ">
                    open
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </template>
        </v-table>
      </v-card>
    </v-dialog>
  </v-row>
</template>
