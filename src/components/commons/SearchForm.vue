<script setup>
    import { ref } from 'vue';
    import { debounce } from 'lodash-es';

    const searchString = ref('');
    const emit = defineEmits(['update:searchString']);

    const emitSearch = debounce(() => {
        emit('update:searchString', searchString.value);
    }, 500);

    const handleInput = () => {
        emitSearch();
    };
</script>

<template>
    <div class="input-group mb-2">
        <input
            type="text"
            class="form-control"
            id="search"
            v-model="searchString"
            @input="handleInput"
        />
        <label for="search" class="input-group-text">
            <i class="bi bi-search"></i>
        </label>
    </div>
</template>
