<script setup>
    import { taxonClassIcons } from '@/assets/taxonclass2icon';
    import ParameterStore from '@/lib/parameterStore';

    const class_ = ParameterStore.getInstance().class;

    function updateClass(className) {
        class_.value = class_.value == className ? null : className;
    }
</script>

<template>
    <label
        ><strong
            >{{ $t('taxon.class') }} <i class="fa-solid fa-leaf"></i>
            <i class="fa-solid fa-paw"></i></strong
    ></label>
    <div>
        <div class="row g-1 mt-1" id="classTaxonFilters">
            <div
                v-for="value of Object.keys(taxonClassIcons.Animalia)"
                :key="value"
                class="col"
            >
                <BButton
                    pill
                    variant="outline-primary"
                    :aria-label="`Button to select ${value} class of taxon`"
                    :pressed="class_ == value"
                    @click="updateClass(value)"
                    data-testid="Animalia button parameter"
                    >{{ $t(`taxonsClass.Animalia.${value}`) }}</BButton
                >
            </div>
            <div
                v-for="value of Object.keys(taxonClassIcons.Plantae)"
                :key="value"
                class="col"
            >
                <BButton
                    pill
                    variant="outline-success"
                    :pressed="class_ == value"
                    @click="updateClass(value)"
                    data-testid="Plantae button parameter"
                    :aria-label="`Button to select ${value} class of taxon`"
                    >{{ $t(`taxonsClass.Plantae.${value}`) }}</BButton
                >
            </div>
        </div>
    </div>
</template>

<style scoped>
    .scroll-container-wrapper {
        position: relative;
        display: flex;
        align-items: center;
    }

    .row {
        display: flex;
        overflow-x: auto;
        scroll-behavior: smooth;
    }

    /* Hide scrollbar for Chrome, Safari and Opera */
    #classTaxonFilters::-webkit-scrollbar {
        display: none;
    }

    /* Hide scrollbar for IE, Edge and Firefox */
    @media screen and (max-width: 800px) {
        #classTaxonFilters {
            -ms-overflow-style: none; /* IE and Edge */
            scrollbar-width: none; /* Firefox */
            flex-wrap: nowrap;
        }
    }
    @media screen and (min-width: 800px) {
        #classTaxonFilters {
            overflow-x: scroll;
        }
    }
</style>
