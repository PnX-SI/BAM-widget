<script setup lang="ts">
    import { ref, computed, watch } from 'vue';
    import { useIntersectionObserver } from '@vueuse/core';

    import { NO_IMAGE_URL } from '@/assets/constant';
    import { MediaType, Taxon } from '@/lib/models';
    import ParameterStore from '@/lib/parameterStore';

    // Components
    import TaxonThumbnail from './TaxonThumbnail.vue';
    import TaxonDetailed from './TaxonDetailed.vue';
    import { Connector } from '@/lib/connectors/connector';
    import { perfMarkOnce } from '@/lib/perf';
    import { getEnricher } from '@/lib/enrichment/enricher';

    const { mode, connector, lang, customDetailPage, wkt, dateMin, dateMax } =
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

    /**
     * Sources that list taxa by identifier only: name, class and rank are
     * completed for the cards that are displayed.
     */
    function fetchTaxonInfo() {
        if (taxon.acceptedScientificName || !taxon.taxonId) return;
        enricher.getTaxonInfo(taxon.taxonId, connector.value).then((info) => {
            if (!info) return;
            taxon.acceptedScientificName = info.scientificName;
            taxon.taxonRank = info.rank;
            taxon.class = taxon.class ?? info.class;
            taxon.kingdom = taxon.kingdom ?? info.kingdom;
            if (!vernacularName.value && info.vernacularName) {
                vernacularName.value = info.vernacularName;
            }
        });
    }

    /**
     * The date of the last observation is only shown by the detailed view,
     * and some sources give it per taxon: it is requested when the card
     * comes into view, so it follows the scroll.
     */
    const card = ref<any>(null);
    const isVisible = ref(false);
    const { stop: stopObservingCard } = useIntersectionObserver(
        () => card.value?.$el,
        ([entry]) => {
            if (!entry?.isIntersecting) return;
            isVisible.value = true;
            stopObservingCard();
            fetchLastSeenDate();
        },
        { rootMargin: '300px' }
    );

    function fetchLastSeenDate() {
        if (
            !isVisible.value ||
            taxon.lastSeenDate ||
            mode.value === 'gallery' ||
            connector.value.capabilities.lastSeenDate !== 'lazy'
        ) {
            return;
        }
        enricher
            .getLastSeenDate(taxon.taxonId, connector.value, {
                geometry: wkt.value,
                dateMin: dateMin.value,
                dateMax: dateMax.value,
            })
            .then((date) => {
                if (date) taxon.lastSeenDate = date;
            });
    }

    fetchTaxonInfo();
    fetchTaxonImage();
    fetchTaxonAudio();
    refreshVernacularName();
    fetchStatus(connector.value);

    watch(lang, () => {
        refreshVernacularName();
    });
    watch(mode, fetchLastSeenDate);
</script>

<template>
    <TaxonThumbnail
        ref="card"
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
        ref="card"
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
