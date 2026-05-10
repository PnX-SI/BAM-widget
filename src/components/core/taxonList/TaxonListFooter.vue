<script setup>
    import ParameterStore from '@/lib/parameterStore';
    import DatasetList from './DatasetList.vue';
    const parameterStore = ParameterStore.getInstance();
    const { connector, primaryColor } = parameterStore;

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
</script>

<template>
    <div class="footer-wrapper">
        <div
            v-if="props.loadingDone"
            id="data-source-credits"
            data-testid="Data source credits"
            :style="{ color: '#' + primaryColor }"
        >
            <a
                href="https://si.ecrins-parcnational.com/blog/2025-08-BAM-widget-en.html"
                target="_blank"
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
            {{ $t('in') }}
            <a :href="connector.getSourceUrl()" target="_blank">
                {{ connector.name }}
            </a>
            <BTooltip
                v-if="connector.sourceDetailMessage()"
                style="z-index: 500"
            >
                <template #target>
                    <a class="ms-1">
                        <i class="bi bi-info-circle"></i>
                    </a>
                </template>
                {{ connector.sourceDetailMessage() }}
            </BTooltip>
            <DatasetList
                v-if="props.datasets.length > 0"
                :datasets="props.datasets"
            ></DatasetList>
        </div>
    </div>
</template>

<style scoped>
    .footer-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 12px 16px;
    }

    #data-source-credits {
        background: white;
        border-radius: 50px;
        padding: 10px 20px;
        box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
        justify-content: center;
        transition:
            box-shadow 0.3s ease,
            transform 0.3s ease;
        max-width: min(95%, 800px);
        width: auto;
    }

    #data-source-credits:hover {
        box-shadow: rgba(0, 0, 0, 0.24) 0px 2px 8px;
        transform: translateY(-1px);
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
        .footer-wrapper {
            padding: 10px 12px;
        }

        #data-source-credits {
            padding: 8px 16px;
            font-size: 14px;
            gap: 4px;
        }
    }
</style>
