import { ref, computed } from 'vue'

export const useStartLoader = ref(false)
export const useLoading = computed({
    set (val) {
        useStartLoader.value = val
    },
    get () {
        return useStartLoader.value
    }
})

export const useLoadingForms = computed({
    set (val) {
        useStartLoader.value = val
    },
    get () {
        return useStartLoader.value
    }
})

export const useShowResponse = ref(false)