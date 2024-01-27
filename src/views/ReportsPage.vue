<script>
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  startAfter,
  endBefore
} from "firebase/firestore";
export default {
  data: () => ({
    archives: [],
    lastVisible: {},
  }),
  async mounted() {
    this.getData();
  },
  methods: {
    async endAtSnap() {
      const next = query(
        collection(this.$firestore, "records"),
        where("user.uid", "==", this.$mainUser.uid),
        orderBy("data.time"),
        endBefore(this.lastVisible),
        limit(4)
      );
      await this.populateData(next, false);
    },
    async startAfter() {
      const next = query(
        collection(this.$firestore, "records"),
        where("user.uid", "==", this.$mainUser.uid),
        orderBy("data.time"),
        startAfter(this.lastVisible),
        limit(4)
      );
      await this.populateData(next);
    },
    async getData() {
      const q = query(
        collection(this.$firestore, "records"),
        where("user.uid", "==", this.$mainUser.uid),
        orderBy("data.time"),
        limit(4)
      );
      await this.populateData(q);
    },
    async populateData(query, last=true) {
      this.archives = []
      const querySnapshot = await getDocs(query);
      this.lastVisible = last? querySnapshot.docs[querySnapshot.docs.length - 1]:querySnapshot.docs[0];
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
        this.archives.push({ ...doc.data(), uid: doc.id });
      });
    },
  },
};
</script>
<template>
  <div>
    <v-table>
      <template #default>
        <thead>
          <tr>
            <th>Number</th>
            <th>Blocks</th>
            <th>Version</th>
            <th>Time</th>
            <th>User</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(archive, i) in archives" :key="i">
            <td>
              {{ i + 1 }}
            </td>
            <td>
              <div v-html="archive.data.blocks[0].data.text"></div>
            </td>
            <td>
              {{ archive.data.version }}
            </td>
            <td>
              {{ archive.data.time }}
            </td>
            <td>
              {{ archive.user.name }}
            </td>
            <td>
              <v-btn
                color="primary"
                variant="plain"
                class="text-capitalize"
                @click="$router.push(`/report?StudyInstanceUID=${archive.uid}`)"
              >
                Edit
              </v-btn>
            </td>
          </tr>
        </tbody>
      </template>
    </v-table>
    <v-row no-gutters justify="center">
      <v-btn icon="mdi-chevron-left" variant="flat" @click="endAtSnap" />
      <v-btn icon="mdi-chevron-right" variant="flat" @click="startAfter"/>
    </v-row>
  </div>
</template>
