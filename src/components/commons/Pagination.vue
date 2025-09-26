<script setup>
    import { watch, ref, computed, watchEffect } from 'vue';

    const props = defineProps({
        itemPerPage: Number,
        pageIndex: Number,
        totalItems: Number,
    });

    const pageIndex = ref(props.pageIndex);
    const totalItems = ref(props.totalItems);

    const emit = defineEmits(['update:page']);
    watch(pageIndex, () => {
        emit('update:page', pageIndex.value);
    });
    watchEffect(() => {
        pageIndex.value = props.pageIndex;
    });

    function isActive(selectedPageIndex) {
        return selectedPageIndex === pageIndex.value
            ? 'page-item active'
            : 'page-item';
    }

    function isDisabled(pageIndex, previous = false) {
        if (previous) {
            return pageIndex === 0 ? 'page-item disabled' : 'page-item';
        } else {
            return pageIndex === maxNumberOfPages.value - 1
                ? 'page-item disabled'
                : 'page-item';
        }
    }

    function incrementPage() {
        if (pageIndex.value < maxNumberOfPages.value - 1) {
            pageIndex.value++;
        }
    }

    function decrementPage() {
        if (pageIndex.value > 0) {
            pageIndex.value--;
        }
    }

    const maxNumberOfPages = computed(() => {
        return Math.ceil(totalItems.value / 20);
    });

    const pageToShow = computed(() => {
        const pages = [];
        const halfWindow = 2; // Nombre de pages à afficher de chaque côté de la page actuelle
        let start = Math.max(0, pageIndex.value - halfWindow);
        let end = Math.min(
            maxNumberOfPages.value - 1,
            pageIndex.value + halfWindow
        );

        if (end - start + 1 < 5) {
            if (start === 0) {
                end = Math.min(
                    maxNumberOfPages.value - 1,
                    end + (5 - (end - start + 1))
                );
            } else {
                start = Math.max(0, start - (5 - (end - start + 1)));
            }
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        return pages;
    });
</script>

<template>
    <nav class="d-flex justify-content-center" aria-label="Pagination">
        <ul class="pagination">
            <li id="previous" :class="isDisabled(pageIndex, true)">
                <a
                    class="page-link"
                    @click="pageIndex !== 0 ? decrementPage() : ''"
                    aria-label="Previous"
                >
                    &laquo;
                </a>
            </li>
            <li
                v-for="i in pageToShow"
                :key="i"
                :class="isActive(i)"
                @click="pageIndex = i"
            >
                <a class="page-link">{{ i + 1 }}</a>
            </li>
            <li id="next" :class="isDisabled(pageIndex, false)">
                <a
                    class="page-link"
                    @click="
                        pageIndex < maxNumberOfPages - 1 ? incrementPage() : ''
                    "
                    aria-label="Next"
                >
                    &raquo;
                </a>
            </li>
        </ul>
    </nav>
</template>

<style scoped>
    .pagination {
        margin-top: 0.5em;
        margin-bottom: 0.5em;
    }
    .page-link {
        cursor: default; /* Change le curseur en pointeur */
        user-select: none; /* Empêche la sélection de texte */
    }
</style>
