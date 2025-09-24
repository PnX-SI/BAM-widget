<script setup>
    import { ref, watch } from 'vue';

    const searchString = ref('');

    const emit = defineEmits(['update:searchString']);

    watch(searchString, () => {
        emit('update:searchString', searchString.value);
    });
</script>

<template>
    <div class="input-group mb-2">
        <input
            type="text"
            class="form-control"
            id="search"
            v-model="searchString"
        />
        <label for="search" class="input-group-text"
            ><i class="bi bi-search"></i
        ></label>
    </div>
</template>
