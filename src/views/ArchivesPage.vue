<script>
import { collection, query, where, getDocs } from "firebase/firestore";
export default {
    data: () => ({
        archives: [],
        loading: false
    }),
  async mounted() {
    this.loading = true
    await this.getData();
    this.loading = false
  },
  methods: {
    async getData() {
      const q = query(
        collection(this.$firestore, "archives"),
        where("user.uid", "==", this.$mainUser.uid)
      );

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        this.archives.push({...doc.data(), uid: doc.id})
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
                {{ i+1 }}
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
                <v-btn color="primary" variant="plain" class="text-capitalize" @click="$router.push(`/report?StudyInstanceUID=${archive.uid}&collection=true`)">
                    Edit
                </v-btn>
            </td>
          </tr>
        </tbody>
      </template>
    </v-table>
    <v-dialog v-model="loading">
      <v-progress-circular
        indeterminate
        :size="66"
        :width="10"
        class="mx-auto"
      ></v-progress-circular>
    </v-dialog>
  </div>
</template>
