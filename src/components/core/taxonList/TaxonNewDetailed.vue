<script setup lang="ts">
    import Credits from '@/components/commons/Credits.vue';
    import { Media } from '@/lib/models';

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
    <div class="detailed">
        <div class="image-container">
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
                :size="35"
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
            <strong>Credits</strong>
            <div v-if="props.audio" class="subcredits">
                <strong>Audio :</strong>
                <Credits
                    :media="props.audio"
                    link-color="link-dark"
                    class=""
                ></Credits>
            </div>
            <div v-if="props.picture" class="subcredits">
                <strong>Picture </strong>
                <Credits
                    :media="props.picture"
                    link-color="link-dark"
                    class="ml-1"
                ></Credits>
            </div>
        </div>
    </div>
</template>
<style scoped>
    .detailed {
        box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
        display: flex;
        justify-content: space-between;
        flex-direction: column;
        border-radius: 5px;
    }

    .image-container {
        margin-top: 1em;
        position: relative;
        display: flex;
        justify-content: center;
    }

    .audio-overlay {
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10;
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
        strong {
            color: #666;
            font-size: 1.4rem;
        }
    }
    .subcredits {
        display: flex;
        flex-direction: row;
        gap: 5px;
        padding-left: 1em;
        strong {
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
        strong {
            color: #444;
        }
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
        background-color: #efefef;
        color: #666;
        font-size: 0.8rem;
        text-align: center;
        border-radius: 5px;
        margin-top: 1em;
    }
</style>
