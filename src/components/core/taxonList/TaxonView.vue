<script setup lang="ts">
    import { ref, computed, watch } from 'vue';

    import { NO_IMAGE_URL } from '@/assets/constant';
    import { MediaType, Taxon } from '@/lib/models';
    import ParameterStore from '@/lib/parameterStore';

    // Components
    import TaxonThumbnail from './TaxonThumbnail.vue';
    import TaxonDetailed from './TaxonDetailed.vue';
    import { Connector } from '@/lib/connectors/connector';
    import { perfMarkOnce } from '@/lib/perf';
    import { getEnricher } from '@/lib/enrichment/enricher';

    const { mode, connector, lang, customDetailPage } =
        ParameterStore.getInstance();
    const enricher = getEnricher();

    const props = defineProps<{
        taxon: Taxon;
        cols: number;
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
            enricher
                .getImages(taxon.taxonId, connector.value)
                .then((medias) => {
                    speciesPhoto.value = medias;
                    if (medias.length) perfMarkOnce('first-image');
                });
        }
    }
    function fetchTaxonAudio() {
        speciesAudio.value = null;
        if (taxon.taxonId) {
            enricher.getSound(taxon.taxonId, connector.value).then((sound) => {
                if (sound) speciesAudio.value = sound;
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
        enricher
            .getVernacularName(taxon.taxonId, connector.value, lang.value)
            .then((name) => {
                if (name) {
                    vernacularName.value = name.split(',')[0];
                    taxon.vernacularName = vernacularName.value;
                }
            });
    }

    function fetchStatus(connector: Connector) {
        enricher.getStatus(taxon.taxonId, connector).then((status_) => {
            if (!status_) return;
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
        :cols="props.cols"
        :status="status"
    >
    </TaxonThumbnail>
    <TaxonDetailed
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
