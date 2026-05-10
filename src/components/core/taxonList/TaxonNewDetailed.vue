<script setup lang="ts">
    import Credits from '@/components/commons/Credits.vue';
    import { Media } from '@/lib/models';
    import ParameterStore from '@/lib/parameterStore';
    import { StatusInfo } from './interface';

    const { connector } = ParameterStore.getInstance();
    const props = defineProps<{
        picture: Media;
        audio: Media;
        vernacularName: string;
        acceptedScientificName: string;
        urlDetailPage: string;
        nbObservations: number;
        lastSeenDate: Date;
        status: StatusInfo;
    }>();
</script>
<template>
    <div class="detailed" data-testid="Taxon detailed view">
        <div class="image-container">
            <div v-if="props.status.status">
                <StatusIcon
                    :status="props.status.status"
                    :color="props.status.color"
                ></StatusIcon>
            </div>
            <FullScreenImage
                :media="props.picture"
                :alt="props.picture?.urlSource"
            >
                <img
                    :src="props.picture?.url"
                    :alt="props.picture?.urlSource"
                    data-testid="Taxon picture"
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
            <div class="vernacular-name">
                <strong data-testid="Vernacular name">{{
                    props.vernacularName
                }}</strong>
                <a
                    :href="props.urlDetailPage"
                    data-testid="Taxon detail redirect link"
                >
                    <span class="badge text-bg-secondary ml-1">
                        {{ connector.name }}</span
                    >
                </a>
            </div>
            <em data-testid="Scientific name">{{
                props.acceptedScientificName
            }}</em>
        </div>
        <div class="statistics-wrapper">
            <div class="statistics">
                <span
                    >Vu dernièrement <br />
                    le
                    <strong data-testid="Last seen date">{{
                        props.lastSeenDate.toLocaleDateString()
                    }}</strong></span
                >
            </div>
            <div class="statistics">
                <span
                    >Observé <br />
                    <strong data-testid="Number of observations">{{
                        props.nbObservations
                    }}</strong>
                    fois</span
                >
            </div>
        </div>
        <div class="description">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsam quae
            unde magni non, doloremque rem vitae, laudantium repellendus id eius
            corporis nesciunt ad dolore? Id nemo qui cum harum adipisci.
        </div>
        <div class="credits" v-if="props?.picture.source || props.audio">
            <div v-if="props.audio" class="credit-pill">
                <i class="bi bi-mic"></i>
                <Credits :media="props.audio" link-color="link-dark"></Credits>
            </div>
            <div v-if="props?.picture.source" class="credit-pill">
                <i class="bi bi-camera"></i>
                <Credits
                    :media="props.picture"
                    link-color="link-dark"
                    data-testid="Picture caption"
                ></Credits>
            </div>
        </div>
    </div>
</template>
<style scoped>
    .detailed {
        container-name: detailed;
        container-type: inline-size;
        box-shadow: rgba(0, 0, 0, 0.05) 0px 0px 0px 1px;
        display: flex;
        justify-content: start;
        flex-direction: column;
        border-radius: 5px;
        padding-bottom: 1em;
        padding-top: 1em;
    }

    .image-container {
        margin-top: 1em;
        margin-bottom: 1em;
        position: relative;
        display: flex;
        justify-content: center;
    }

    .audio-overlay {
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%) translateY(50%);
        z-index: 2;
    }
    :deep(.status-btn) {
        position: absolute;
        top: 0px;
        left: 50%;
        transform: translateX(-50%) translateY(-40%);
        z-index: 2;
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
        border-radius: 15px;
        box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
    }
    .credits {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 6px;
        padding: 0.75em 1em 1em;
        justify-content: space-around;
    }

    .credit-pill {
        display: flex;
        align-items: center;
        gap: 5px;
        background-color: #f5f5f5;
        border: 1px solid #e0e0e0;
        border-radius: 999px;
        padding: 3px 10px;
        font-size: 0.75rem;
        color: #666;
    }

    .credit-pill i {
        font-size: 0.8rem;
        color: #999;
    }
    .statistics-wrapper {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
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
        .vernacular-name {
            display: flex;
            flex-direction: row;
            gap: 0.5em;
            align-items: center;
            align-self: center;
        }
    }
    /* TODO drop display hidden when description is available */
    .description {
        padding: 1em;
        background-color: #efefef;
        color: #666;
        font-size: 0.8rem;
        text-align: center;
        border-radius: 5px;
        margin-top: 1em;
        display: none;
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
