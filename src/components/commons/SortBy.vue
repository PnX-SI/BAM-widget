<script setup>
    import { ref, watch } from 'vue';

    const props = defineProps({
        sortByAvailable: { type: Array, required: true },
        sortBy: { type: String, required: true },
        orderBy: { type: String, default: 'asc' },
    });

    const sortByAvailable = props.sortByAvailable;
    const sortBy = ref(props.sortBy);
    const orderBy = ref(props.orderBy);
    const emit = defineEmits(['update:sortBy', 'update:orderBy']);

    function changeOrder() {
        orderBy.value = orderBy.value === 'asc' ? 'desc' : 'asc';
        emit('update:orderBy', orderBy.value);
    }

    watch(sortBy, (newVal) => {
        emit('update:sortBy', newVal);
    });
</script>

<template>
    <div class="input-group">
        <select v-model="sortBy" class="form-select" id="sortby">
            <option
                v-for="field in sortByAvailable"
                :key="`sort-${field.field_name}`"
                :value="field.field_name"
            >
                {{ field.label }}
            </option>
        </select>
        <button class="btn btn-outline-secondary" @click="changeOrder">
            <i v-if="orderBy === 'asc'" class="bi bi-sort-up"></i>
            <i v-else class="bi bi-sort-down"></i>
        </button>
    </div>
    <div></div>
</template>
