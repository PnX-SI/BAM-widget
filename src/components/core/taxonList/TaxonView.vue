<script setup lang="ts">
    import { ref, computed, watch } from 'vue';

    import { NO_IMAGE_URL } from '@/assets/constant';
    import { MediaType, Taxon } from '@/lib/models';
    import ParameterStore from '@/lib/parameterStore';

    // Components
    import TaxonThumbnail from './TaxonThumbnail.vue';
    import TaxonDetailed from './TaxonDetailed.vue';
    import { Connector } from '@/lib/connectors/connector';

    const { mode, connector, lang, customDetailPage } =
        ParameterStore.getInstance();

    const props = defineProps<{
        taxon: Taxon;
    }>();

    const taxon = props.taxon;
    const speciesPhoto = ref([]);
    const speciesAudio = ref(null);
    const vernacularName = ref(taxon.vernacularName);
    const status = ref<{ status: string; color: string }>({});

    function fetchDetailUrl(taxonID) {
        if (customDetailPage.value) {
            const url = customDetailPage.value.replace('{taxonID}', taxonID);
            return url;
        }
        return connector.value.getTaxonDetailPage(taxon.taxonId);
    }

    function fetchTaxonImage() {
        speciesPhoto.value = [];
        if (taxon.taxonId) {
            connector.value.imageSource
                .fetchPicture(taxon.taxonId, connector.value)
                .then((response) => {
                    speciesPhoto.value = response;
                });
        }
    }
    function fetchTaxonAudio() {
        speciesAudio.value = null;
        if (taxon.taxonId) {
            connector.value.soundSource
                .fetchSound(taxon.taxonId, connector.value)
                .then((response) => {
                    if (response) speciesAudio.value = response[0];
                });
        }
    }
    const mediaDisplayed = computed(() => {
        if (!speciesPhoto.value) {
            return { url: NO_IMAGE_URL, typeMedia: MediaType.image };
        }
        return speciesPhoto.value.length == 0
            ? { url: NO_IMAGE_URL, typeMedia: MediaType.image }
            : speciesPhoto.value[0];
    });

    function refreshVernacularName() {
        connector.value.fetchVernacularName(taxon.taxonId).then((name) => {
            if (name) {
                vernacularName.value = name.split(',')[0];
                taxon.vernacularName = vernacularName.value;
            }
        });
    }

    function fetchStatus(connector: Connector) {
        connector.fetchTaxonStatus(taxon.taxonId).then((status_) => {
            status.value = {
                status: status_,
                color: connector.getStatusColor(status_),
            };
        });
    }

    fetchTaxonImage();
    fetchTaxonAudio();
    refreshVernacularName();
    fetchStatus(connector.value);

    watch(lang, () => {
        refreshVernacularName();
    });
</script>

<template>
    <TaxonThumbnail
        v-if="mode == 'gallery'"
        :picture="mediaDisplayed"
        :audio="speciesAudio"
        :vernacular-name="vernacularName || taxon.acceptedScientificName"
        :url-detail-page="fetchDetailUrl(taxon.taxonId)"
        :accepted-scientific-name="taxon.acceptedScientificName"
        :status="status"
    >
    </TaxonThumbnail>
    <TaxonNewDetailed
        v-else
        :picture="mediaDisplayed"
        :audio="speciesAudio"
        :accepted-scientific-name="taxon.acceptedScientificName"
        :vernacular-name="vernacularName || taxon.acceptedScientificName"
        :url-detail-page="fetchDetailUrl(taxon.taxonId)"
        :nb-observations="taxon?.nbObservations"
        :last-seen-date="taxon?.lastSeenDate"
        :status="status"
    />
</template>
