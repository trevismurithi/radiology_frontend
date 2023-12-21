<template>
    <v-snackbar
      :model-value="props.snackbar"
      @update:model-value="emits('update-bool', false)"
      :timeout="timeout"
      :content-class="color"
    >
      {{ text }}

      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="emits('update-bool', false)"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
</template>
<script lang="ts" setup>

const timeout = 3000
const props = defineProps({
    snackbar: {
        type: Boolean,
        default: false
    },
    text: {
        type: String,
        default: ''
    },
    color: {
        type: String,
        default: 'blue'
    }
})

const emits = defineEmits(['update-bool'])

</script>