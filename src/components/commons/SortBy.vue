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
    <div class="sort-container">
        <div class="sort-select-wrapper">
            <select v-model="sortBy" class="sort-select" id="sortby">
                <option
                    v-for="field in sortByAvailable"
                    :key="`sort-${field.field_name}`"
                    :value="field.field_name"
                >
                    {{ field.label }}
                </option>
            </select>
        </div>

        <button
            class="sort-btn"
            @click="changeOrder"
            :title="$t('taxon.sortOrder')"
        >
            <i
                :key="orderBy"
                :class="orderBy === 'asc' ? 'bi bi-sort-up' : 'bi bi-sort-down'"
            ></i>
        </button>
    </div>
</template>

<style scoped>
    /* Conteneur général */
    .sort-container {
        display: flex;
        align-items: center;
        background: #fff;
        border-radius: 50px;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
        padding: 6px 10px;
        gap: 8px;
        transition: all 0.3s ease;
        width: fit-content;
        height: 42px;
    }

    /* Sélecteur moderne */
    .sort-select-wrapper {
        position: relative;
        flex: 1;
    }

    .sort-select {
        appearance: none;
        background: transparent;
        border: none;
        font-size: 15px;
        color: #333;
        outline: none;
        cursor: pointer;
        padding: 6px 28px 6px 10px;
        border-radius: 25px;
        font-weight: 500;
    }

    /* Flèche du select personnalisée */
    .sort-select-wrapper::after {
        content: '▼';
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 10px;
        color: #888;
        pointer-events: none;
    }

    /* Bouton de tri */
    .sort-btn {
        background: #fff;
        border: none;
        color: #afafaf;
        border-radius: 50%;
        width: 38px;
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        flex-shrink: 0;
        font-size: 1rem;
    }

    .sort-btn:hover {
        background: #efefef;
    }

    /* Animation d’icône de tri */
    .rotate-icon-enter-from,
    .rotate-icon-leave-to {
        opacity: 0;
        transform: rotate(-90deg) scale(0.8);
    }
    .rotate-icon-enter-active,
    .rotate-icon-leave-active {
        transition: all 0.25s ease;
    }

    /* Effet de focus sur le conteneur */
    .sort-container:focus-within {
        box-shadow: 0 4px 14px rgba(74, 144, 226, 0.25);
    }
</style>
