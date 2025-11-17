<script setup>
    import { ref, watch } from 'vue';
    import { onClickOutside } from '@vueuse/core';
    import ParameterStore from '@/lib/parameterStore';

    const { wkt } = ParameterStore.getInstance();

    const props = defineProps({
        sortByAvailable: { type: Array, required: true },
        sortBy: { type: String, required: true },
        orderBy: { type: String, default: 'asc' },
    });

    const emit = defineEmits(['update:sortBy', 'update:orderBy']);

    const sortBy = ref(props.sortBy);
    const orderBy = ref(props.orderBy);

    watch(
        () => props.sortBy,
        (v) => (sortBy.value = v)
    );
    watch(
        () => props.orderBy,
        (v) => (orderBy.value = v)
    );

    // Reset si WKT change
    const initialParams = {
        sortBy: props.sortBy,
        orderBy: props.orderBy,
    };
    watch(wkt, () => {
        sortBy.value = initialParams.sortBy;
        orderBy.value = initialParams.orderBy;
    });

    const isOpen = ref(false);
    const dropdownRef = ref(null);
    onClickOutside(dropdownRef, () => (isOpen.value = false));

    function selectSort(field) {
        if (field === sortBy.value) {
            orderBy.value = orderBy.value === 'asc' ? 'desc' : 'asc';
            emit('update:orderBy', orderBy.value);
        } else {
            sortBy.value = field;
            emit('update:sortBy', field);
        }
    }

    function toggleOrder() {
        orderBy.value = orderBy.value === 'asc' ? 'desc' : 'asc';
        emit('update:orderBy', orderBy.value);
    }
</script>

<template>
    <div class="sort-container" ref="dropdownRef">
        <button
            class="round-btn"
            @click="isOpen = !isOpen"
            :title="$t('sortBy')"
        >
            <i
                :class="orderBy === 'asc' ? 'bi bi-sort-up' : 'bi bi-sort-down'"
            ></i>
        </button>

        <transition name="fade-slide">
            <div v-if="isOpen" class="sort-menu">
                <div
                    v-for="field in sortByAvailable"
                    :key="field.field_name"
                    class="sort-item"
                    :class="{ active: sortBy === field.field_name }"
                    @click="selectSort(field.field_name)"
                >
                    <span>{{ field.label }}</span>

                    <i
                        v-if="sortBy === field.field_name"
                        :class="
                            orderBy === 'asc'
                                ? 'bi bi-arrow-up-short'
                                : 'bi bi-arrow-down-short'
                        "
                        class="order-icon"
                    ></i>
                </div>
            </div>
        </transition>
    </div>
</template>

<style scoped>
    .sort-container {
        position: relative;
        display: inline-block;
    }

    .sort-menu {
        position: absolute;
        top: 48px;
        right: 0;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.1);
        padding: 6px 0;
        min-width: 180px;
        z-index: 10;
    }

    .sort-item {
        padding: 8px 14px;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: background 0.2s;
        font-weight: 500;
    }
    .sort-item:hover {
        background: #efefef;
    }
    .sort-item.active {
        background: #efefef;
        color: #888;
    }

    .order-icon {
        margin-left: 10px;
        font-size: 1.1rem;
        opacity: 0.8;
    }

    .divider {
        border: none;
        border-top: 1px solid #eee;
        margin: 6px 0;
    }

    .sort-order {
        padding: 8px 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
        transition: background 0.2s ease;
        font-weight: 500;
    }
    .sort-order:hover {
        background: #f3f6ff;
    }

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
