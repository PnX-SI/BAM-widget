<script setup lang="ts">
    import Credits from '@/components/commons/Credits.vue';
    import { Media } from '@/lib/models';
    import ParameterStore from '@/lib/parameterStore';
    import { computed } from 'vue';

    const { nbTaxonPerLine } = ParameterStore.getInstance();
    const colClasses = computed(() => {
        const lg = Math.floor(12 / nbTaxonPerLine.value);
        const md = Math.floor(12 / Math.ceil(nbTaxonPerLine.value / 2));

        return ['col-12', `col-md-${md}`, `col-lg-${lg}`];
    });
    const props = defineProps<{
        picture: Media;
        audio: Media;
        vernacularName: string;
        acceptedScientificName: string;
        urlDetailPage: string;
        nbObservations: number;
        lastSeenDate: Date;
    }>();
</script>
<template>
    <div :class="[...colClasses, 'detailed']" data-testid="Taxon detailed view">
        <div class="image-container">
            <div>
                <BPopover :delay="{ show: 0, hide: 0 }" :close-on-hide="true">
                    <template #target>
                        <div class="warning-btn">
                            <i class="bi bi-exclamation-triangle-fill"></i>
                        </div>
                    </template>
                    Danger
                </BPopover>
            </div>
            <FullScreenImage
                :media="props.picture"
                :alt="props.picture?.urlSource"
            >
                <img
                    :src="props.picture?.url"
                    :alt="props.picture?.urlSource"
                />
            </FullScreenImage>
            <AudioPlayer
                v-if="props.audio?.url"
                :audio="props.audio"
                variant="button"
                :size="45"
                class="audio-overlay"
            ></AudioPlayer>
        </div>
        <div class="names">
            <strong>{{ props.vernacularName }}</strong>
            <em>{{ props.acceptedScientificName }}</em>
        </div>
        <div class="statistics-wrapper">
            <div class="statistics">
                <span
                    >Vu dernièrement le
                    <strong>{{
                        props.lastSeenDate.toLocaleDateString()
                    }}</strong></span
                >
            </div>
            <div class="statistics">
                <span
                    >Observé
                    <strong>{{ props.nbObservations }}</strong> fois</span
                >
            </div>
        </div>
        <div class="description">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsam quae
            unde magni non, doloremque rem vitae, laudantium repellendus id eius
            corporis nesciunt ad dolore? Id nemo qui cum harum adipisci.
        </div>
        <div class="credits">
            <div class="credits-header">
                <h5>Credits</h5>
            </div>
            <div v-if="props.audio" class="subcredits">
                <i class="bi bi-music-note-beamed"></i>
                <Credits :media="props.audio" link-color="link-dark"></Credits>
            </div>
            <div v-if="props.picture" class="subcredits">
                <i class="bi bi-camera"></i>
                <Credits
                    :media="props.picture"
                    link-color="link-dark"
                ></Credits>
            </div>
        </div>
    </div>
</template>
<style scoped>
    .detailed {
        container-name: detailed;
        container-type: inline-size;
        box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);
        display: flex;
        justify-content: start;
        flex-direction: column;
        border-radius: 5px;
    }

    .image-container {
        margin-top: 1em;
        position: relative;
        display: flex;
        justify-content: center;
        margin-bottom: 1em;
    }

    .audio-overlay {
        position: absolute;
        bottom: 0px;
        left: 50%;
        transform: translateX(-50%) translateY(50%);
        z-index: 2;
    }
    .warning-btn {
        position: absolute;
        top: 0px;
        left: 50%;
        transform: translateX(-50%) translateY(-40%);
        z-index: 2;
        background-color: #c44d56;
        color: white;
        border: 1px solid #fff;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
    }

    img {
        display: flex;
        width: 150px;
        height: 150px;
        aspect-ratio: 1;
        object-fit: cover;
        border-radius: 50%;
        box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
    }
    .credits {
        padding: 1em;
    }

    .credits-header {
        display: flex;
        align-items: center;
        gap: 0.5em;
        color: #666;

        i {
            font-size: 1.1rem;
        }

        strong {
            font-size: 1.2rem;
            font-weight: 600;
        }
    }

    .subcredits {
        display: flex;
        align-items: center;
        gap: 0.5em;
        font-size: 0.85rem;
        color: #666;
        margin-left: 1em;

        i {
            color: #888;
            font-size: 1rem;
        }
    }
    .statistics-wrapper {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin-top: 1em;
        column-gap: 0.5em;
    }
    .statistics {
        display: flex;
        flex-direction: column;
        color: #666;
        text-align: center;
        background-color: rgba(239, 239, 239, 0.5);
        padding: 1em;
        border-radius: 5px;
        strong {
            color: #444;
        }
        width: 50%;
        font-size: 0.9rem;
    }
    .names {
        text-align: center;
        display: flex;
        flex-direction: column;
        strong {
            font-size: 1.2em;
        }
        em {
            color: #888;
        }
    }
    .description {
        padding: 1em;
        color: #666;
        font-size: 0.8rem;
        text-align: center;
        border-radius: 5px;
        margin-top: 1em;
    }
    @container detailed (width < 275px) {
        .statistics-wrapper {
            flex-direction: column;
            row-gap: 0.5em;
        }
        .statistics {
            width: 100%;
        }
    }
</style>
