<script setup>
    import { ref, watch } from 'vue';
    import ParameterStore from '@/lib/parameterStore';
    import DatasetList from './DatasetList.vue';
    import { getCentroidFromWKT, reverseGeocode } from '@/lib/utils';
    const parameterStore = ParameterStore.getInstance();
    const { connector, primaryColor, wkt, lang } = parameterStore;

    const props = defineProps({
        loadingDone: {
            type: Boolean,
        },
        numberOfSpecies: {
            type: Number,
        },
        datasets: {
            type: Array,
        },
    });

    const isExpanded = ref(false);
    const touchStartY = ref(0);
    const touchEndY = ref(0);
    const locationName = ref(null);
    const loadingLocation = ref(false);

    // Fetch location name when WKT changes
    async function updateLocationName() {
        if (!wkt.value || wkt.value.trim() === '') {
            locationName.value = null;
            return;
        }

        loadingLocation.value = true;

        try {
            const center = getCentroidFromWKT(wkt.value);
            if (center) {
                const place = await reverseGeocode(
                    center.lat,
                    center.lon,
                    lang.value
                );
                locationName.value = place;
            } else {
                locationName.value = null;
            }
        } catch (error) {
            console.error('Error fetching location name:', error);
            locationName.value = null;
        } finally {
            loadingLocation.value = false;
        }
    }

    // Watch for WKT changes
    watch(wkt, updateLocationName, { immediate: true });

    function toggleExpand() {
        isExpanded.value = !isExpanded.value;
    }

    function handleTouchStart(event) {
        touchStartY.value = event.touches[0].clientY;
    }

    function handleTouchMove(event) {
        touchEndY.value = event.touches[0].clientY;
    }

    function handleTouchEnd() {
        const swipeDistance = touchStartY.value - touchEndY.value;
        const minSwipeDistance = 30;

        if (swipeDistance > minSwipeDistance && !isExpanded.value) {
            // Swipe up to expand
            isExpanded.value = true;
        } else if (swipeDistance < -minSwipeDistance && isExpanded.value) {
            // Swipe down to collapse
            isExpanded.value = false;
        }

        touchStartY.value = 0;
        touchEndY.value = 0;
    }
</script>

<template>
    <div
        class="footer-wrapper"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
    >
        <div
            v-if="props.loadingDone"
            id="data-source-credits"
            data-testid="Data source credits"
            :style="{ color: '#' + primaryColor }"
            :class="{ expanded: isExpanded }"
        >
            <div class="footer-header" @click="toggleExpand">
                <div class="footer-main-content">
                    <a
                        href="https://si.ecrins-parcnational.com/blog/2025-08-BAM-widget-en.html"
                        target="_blank"
                        @click.stop
                    >
                        <img
                            src="https://geonature.fr/documents/autres/BAM/BAM-logo.png"
                            height="30px"
                            class="me-1"
                            alt="BAM logo"
                        />
                    </a>
                    <strong
                        >{{ props.numberOfSpecies }}
                        {{ $t('taxon.taxonFound') }}</strong
                    >
                    <template v-if="locationName">
                        {{ $t('near') }}
                        <strong>{{ locationName }}</strong>
                    </template>
                    {{ $t('in') }}
                    <a
                        :href="connector.getSourceUrl()"
                        target="_blank"
                        @click.stop
                    >
                        {{ connector.name }}
                    </a>
                </div>
                <button class="expand-toggle" :class="{ rotated: isExpanded }">
                    <i class="bi bi-chevron-up"></i>
                </button>
            </div>

            <div class="footer-expanded-content" v-show="isExpanded">
                <div
                    v-if="connector.sourceDetailMessage()"
                    class="source-detail-message"
                >
                    <i class="bi bi-info-circle me-2"></i>
                    {{ connector.sourceDetailMessage() }}
                </div>
                <DatasetList
                    v-if="props.datasets.length > 0"
                    :datasets="props.datasets"
                ></DatasetList>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .footer-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0;
    }

    #data-source-credits {
        background: white;
        border-radius: 0 0 8px 8px;
        border: 1px solid #dfdfdf;
        width: 100%;
        overflow: hidden;
        transition: max-height 0.3s ease;
        display: flex;
        flex-direction: column;
    }

    #data-source-credits:not(.expanded) {
        max-height: fit-content;
    }

    #data-source-credits.expanded {
        max-height: 400px;
    }

    .footer-header {
        padding: 12px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        cursor: pointer;
        user-select: none;
    }

    .footer-main-content {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
        flex: 1;
        justify-content: center;
    }

    .expand-toggle {
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.3s ease;
        font-size: 1.2em;
        flex-shrink: 0;
    }

    .expand-toggle:hover {
        opacity: 0.7;
    }

    .expand-toggle.rotated {
        transform: rotate(180deg);
    }

    .footer-expanded-content {
        padding: 0 20px 12px 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .source-detail-message {
        padding: 10px;
        background: #f8f9fa;
        border-radius: 6px;
        display: flex;
        align-items: flex-start;
        font-size: 0.9em;
        line-height: 1.4;
    }

    #data-source-credits a {
        text-decoration: underline;
        transition: opacity 0.3s ease;
        color: inherit;
    }

    #data-source-credits a:hover {
        opacity: 0.7;
    }

    #data-source-credits img {
        transition: transform 0.3s ease;
        vertical-align: middle;
    }

    #data-source-credits img:hover {
        transform: scale(1.05);
    }

    #data-source-credits i {
        color: inherit;
    }

    @media (max-width: 500px) {
        .footer-header {
            padding: 10px 16px;
            font-size: 14px;
        }

        .footer-main-content {
            gap: 4px;
        }

        .footer-expanded-content {
            padding: 0 16px 10px 16px;
        }

        .expand-toggle {
            font-size: 1em;
        }
    }
</style>
