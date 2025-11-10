<script setup>
    import { ref, watch } from 'vue';
    import { onClickOutside } from '@vueuse/core';

    const props = defineProps({
        sortByAvailable: { type: Array, required: true },
        sortBy: { type: String, required: true },
        orderBy: { type: String, default: 'asc' },
    });

    const sortBy = ref(props.sortBy);
    const orderBy = ref(props.orderBy);
    const emit = defineEmits(['update:sortBy', 'update:orderBy']);

    // état du dropdown
    const isOpen = ref(false);
    const dropdownRef = ref(null);
    onClickOutside(dropdownRef, () => (isOpen.value = false));

    function selectSort(field) {
        sortBy.value = field;
        emit('update:sortBy', field);
        isOpen.value = false;
    }

    function changeOrder() {
        orderBy.value = orderBy.value === 'asc' ? 'desc' : 'asc';
        emit('update:orderBy', orderBy.value);
    }

    watch(
        () => props.sortBy,
        (val) => (sortBy.value = val)
    );
    watch(
        () => props.orderBy,
        (val) => (orderBy.value = val)
    );
</script>

<template>
    <div class="sort-container" ref="dropdownRef">
        <!-- Bouton pour ouvrir le menu -->
        <button
            class="sort-menu-btn"
            @click="isOpen = !isOpen"
            :aria-expanded="isOpen"
            :title="$t('sortBy')"
        >
            <i class="bi bi-funnel"></i>
        </button>

        <!-- Menu déroulant -->
        <transition name="fade-slide">
            <div v-if="isOpen" class="sort-menu">
                <div
                    v-for="field in sortByAvailable"
                    :key="field.field_name"
                    class="sort-item"
                    :class="{ active: sortBy === field.field_name }"
                    @click="selectSort(field.field_name)"
                >
                    {{ field.label }}
                </div>
            </div>
        </transition>

        <!-- Bouton d’ordre -->
        <button class="sort-btn" @click="changeOrder" :title="$t('sortOrder')">
            <i
                :key="orderBy"
                :class="orderBy === 'asc' ? 'bi bi-sort-up' : 'bi bi-sort-down'"
            ></i>
        </button>
    </div>
</template>

<style scoped>
    /* Conteneur principal */
    .sort-container {
        display: flex;
        align-items: center;
        background: #fff;
        border-radius: 50px;
        box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
        padding: 2px 2px;
        gap: 8px;
        transition: all 0.3s ease;
        width: fit-content;
        height: 42px;
        position: relative;
    }

    /* Bouton pour ouvrir le menu */
    .sort-menu-btn {
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
        font-size: 1.1rem;
    }

    .sort-menu-btn:hover {
        background: #efefef;
        /* color: #4a90e2; */
    }

    /* Menu déroulant */
    .sort-menu {
        position: absolute;
        top: 48px;
        left: 10px;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.1);
        padding: 6px 0;
        min-width: 160px;
        z-index: 2000;
    }

    .sort-item {
        padding: 6px 14px;
        cursor: pointer;
        transition: background 0.2s ease;
        font-weight: 500;
        color: #333;
    }

    .sort-item:hover {
        background: #f3f6ff;
    }

    .sort-item.active {
        background: #eaf3ff;
        color: #4a90e2;
    }

    /* Bouton d’ordre */
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

    /* Animation du menu */
    .fade-slide-enter-from,
    .fade-slide-leave-to {
        opacity: 0;
        transform: translateY(-6px);
    }
    .fade-slide-enter-active,
    .fade-slide-leave-active {
        transition: all 0.25s ease;
    }
</style>
