<script setup>
    import { ref } from 'vue';
    import { taxonClassIcons } from '@/assets/taxonclass2icon';
    import { onClickOutside } from '@vueuse/core';

    // État local
    const class_ = ref(null);
    const isOpen = ref(false);
    const emit = defineEmits(['select:class']);

    function updateClass(className) {
        class_.value = class_.value === className ? null : className;
        emit('select:class', class_.value);
        isOpen.value = false;
    }

    // Fermer le menu si clic à l’extérieur
    const dropdownRef = ref(null);
    onClickOutside(dropdownRef, () => (isOpen.value = false));
</script>

<template>
    <div class="taxon-dropdown" ref="dropdownRef">
        <!-- Bouton principal -->
        <div
            class="taxon-toggle"
            @click="isOpen = !isOpen"
            :aria-expanded="isOpen"
            :title="$t('taxon.classFilter')"
        >
            <i class="bi bi-funnel"></i>
        </div>

        <!-- Menu déroulant -->
        <transition name="fade-slide">
            <div v-if="isOpen" class="taxon-menu">
                <div class="taxon-scroll">
                    <!-- Animalia -->
                    <div class="dropdown-section">
                        <h6 class="dropdown-header text-primary">
                            <i class="fa-solid fa-paw me-2"></i
                            >{{ $t('Animalia') }}
                        </h6>
                        <div>
                            <div
                                v-for="value in Object.keys(
                                    taxonClassIcons.Animalia
                                )"
                                :key="value"
                                @click="updateClass(value)"
                                class="taxon-item"
                                :class="{ active: class_ === value }"
                            >
                                <i
                                    :class="taxonClassIcons.Animalia[value]"
                                    class="me-2"
                                ></i>
                                {{ $t(`taxonsClass.Animalia.${value}`) }}
                            </div>
                        </div>
                    </div>

                    <!-- Plantae -->
                    <div class="dropdown-section border-top mt-2 pt-2">
                        <h6 class="dropdown-header text-success">
                            <i class="fa-solid fa-leaf me-2"></i
                            >{{ $t('Plantae') }}
                        </h6>
                        <div>
                            <div
                                v-for="value in Object.keys(
                                    taxonClassIcons.Plantae
                                )"
                                :key="value"
                                @click="updateClass(value)"
                                class="taxon-item"
                                :class="{ active: class_ === value }"
                            >
                                <i
                                    :class="taxonClassIcons.Plantae[value]"
                                    class="me-2"
                                ></i>
                                {{ $t(`taxonsClass.Plantae.${value}`) }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<style scoped>
    .taxon-dropdown {
        position: relative;
        display: inline-block;
    }

    /* Bouton principal */
    .taxon-toggle {
        background: #fff;
        border: none;
        border-radius: 50%;
        width: 42px;
        height: 42px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #afafaf;
        cursor: pointer;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
    }

    .taxon-toggle:hover {
        background: #f0f4ff;
        transform: scale(1.05);
    }

    /* Menu stylisé */
    .taxon-menu {
        position: absolute;
        top: 50px;
        right: 0;
        background: #fff;
        border-radius: 14px;
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.1);
        border: none;
        padding: 10px 0;
        min-width: 230px;
        z-index: 100;
        overflow: hidden;
    }

    /* Zone scrollable interne */
    .taxon-scroll {
        max-height: 250px; /* limite de hauteur */
        overflow-y: auto;
        padding-right: 4px; /* pour éviter que la barre touche le texte */
        scroll-behavior: smooth;
    }

    /* Scrollbar stylisée */
    .taxon-scroll::-webkit-scrollbar {
        width: 6px;
    }
    .taxon-scroll::-webkit-scrollbar-track {
        background: transparent;
    }
    .taxon-scroll::-webkit-scrollbar-thumb {
        background: rgba(150, 150, 150, 0.3);
        border-radius: 4px;
    }
    .taxon-scroll:hover::-webkit-scrollbar-thumb {
        background: rgba(150, 150, 150, 0.5);
    }

    /* Firefox */
    .taxon-scroll {
        scrollbar-width: thin;
        scrollbar-color: rgba(150, 150, 150, 0.4) transparent;
    }

    /* Animation d’apparition */
    .fade-slide-enter-from,
    .fade-slide-leave-to {
        opacity: 0;
        transform: translateY(-6px);
    }
    .fade-slide-enter-active,
    .fade-slide-leave-active {
        transition: all 0.25s ease;
    }

    /* Sections du menu */
    .dropdown-section {
        padding: 0 12px;
    }

    .dropdown-header {
        font-size: 0.85rem;
        font-weight: 600;
        margin-bottom: 6px;
        opacity: 0.8;
    }

    .border-top {
        border-top: 1px solid #e6e6e6;
    }

    /* Items */
    .taxon-item {
        border-radius: 8px;
        padding: 6px 10px;
        transition: background 0.25s ease, transform 0.2s ease;
        font-weight: 500;
        color: #333;
        display: flex;
        align-items: center;
        cursor: pointer;
    }

    .taxon-item:hover {
        background: #f3f6ff;
        transform: translateX(2px);
    }

    .taxon-item.active {
        background: #eaf3ff;
        color: #4a90e2;
        font-weight: 600;
    }
</style>
