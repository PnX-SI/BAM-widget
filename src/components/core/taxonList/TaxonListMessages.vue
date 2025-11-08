<script setup>
    import { computed } from 'vue';
    import Loading from '@/components/commons/Loading.vue';
    import ParameterStore from '@/lib/parameterStore';

    const parameterStore = ParameterStore.getInstance();
    const { wkt } = parameterStore;

    const props = defineProps({
        loadingObservations: {
            type: Boolean,
        },
        loadingError: {
            type: Boolean,
        },
        speciesList: {
            type: Array,
        },
        filterSpeciesList: {
            type: Array,
        },
    });
    // Calcul des états pour l'affichage des messages
    const noGeometry = computed(
        () =>
            !wkt.value.length &&
            !props.loadingObservations &&
            !props.loadingError
    );

    const noDataFound = computed(
        () =>
            wkt.value.length &&
            !props.loadingObservations &&
            !props.loadingError &&
            !props.speciesList.length
    );

    const emptySearch = computed(
        () =>
            !props.filterSpeciesList.length &&
            wkt.value.length &&
            !props.loadingObservations
    );
</script>

<template>
    <!-- Message de chargement -->
    <Loading
        id="loadingObs"
        :loadingStatus="props.loadingObservations"
        class="message-box"
    />

    <!-- Message : Aucune géométrie dessinée -->
    <div class="message-box bg-secondary text-white" v-if="noGeometry">
        <h5>{{ $t('drawGeometry') }}</h5>
        <h5>
            <i class="bi bi-square-fill"></i>
            <i class="bi bi-hexagon-fill"></i>
            <i class="bi bi-circle-fill"></i>
            <i class="bi bi-geo-fill"></i>
        </h5>
    </div>

    <!-- Message : Aucune observation trouvée -->
    <div class="message-box bg-warning text-white" v-if="noDataFound">
        {{ $t('noSpeciesObserved') }}
    </div>

    <!-- Message : Recherche vide -->
    <div
        class="message-box bg-warning text-white"
        v-if="emptySearch && !noDataFound && !loadingError"
    >
        {{ $t('emptySearch') }}
    </div>

    <!-- Message : Erreur de chargement -->
    <div
        id="loading-error"
        class="message-box bg-danger text-white"
        v-if="props.loadingError"
    >
        <h5><i class="bi bi-bug"></i> {{ $t('loadingError') }}</h5>
    </div>
</template>

<style scoped>
    .message-box {
        border-radius: 10px;
        text-align: center;
        padding: 1em;
        width: 100%;
        position: relative;
        top: 50%;
        transform: translateY(-50%);
    }

    /* Style spécifique pour le composant Loading */
    #loadingObs {
        background-color: var(--bs-secondary-bg);
        color: var(--bs-secondary-color);
    }
</style>
