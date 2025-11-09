<script setup lang="ts">
    import { Media } from '@/lib/models';

    const props = defineProps<{
        picture: Media;
        audio: Media;
        vernacularName: string;
        acceptedScientificName: string;
        urlDetailPage: string;
    }>();
</script>
<template>
    <div class="col card thumbnail">
        <Image
            :image-url="props.picture?.url"
            :alt="props.picture?.url"
            :title="'Source: ' + props.picture?.source"
            class="card-img"
        ></Image>

        <div class="card-img-overlay">
            <div class="card-title">
                <a
                    style="color: inherit; text-decoration: inherit"
                    :href="props.urlDetailPage"
                    target="_blank"
                >
                    <span>{{ props.vernacularName }}</span></a
                >
                <div class="player">
                    <SingleButtonAudioPlayer
                        v-if="props.audio"
                        :audio="props.audio"
                    ></SingleButtonAudioPlayer>
                </div>
                <BPopover
                    v-if="props.picture.source"
                    :click="true"
                    :close-on-hide="true"
                    :delay="{ show: 0, hide: 0 }"
                >
                    <template #target>
                        <i class="bi bi-c-square-fill copyright-icon"></i>
                    </template>
                    <Credits
                        link-color="link-dark"
                        :media="props.picture"
                        class=""
                    ></Credits>
                </BPopover>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .card {
        border: 0;
        align-content: space-around;
    }
    .card-img {
        object-fit: cover;
        width: 100%;
        aspect-ratio: 1/1;
    }
    .card-title {
        color: white;
        text-shadow: 2px 2px 2px #333;
    }
    @media screen and (max-width: 768px) {
        .card-title span {
            font-size: 2rem;
        }
    }

    .copyright-icon {
        margin-left: 0.2em;
        position: absolute;
        bottom: 5px;
        right: 20px;
        color: #fff;
        text-shadow: none;
    }
    .player {
        margin-left: 0.2em;
        position: absolute;
        bottom: 5px;
        left: 15px;
        color: #fff !important;
        text-shadow: none;
        font-size: 1.4rem;
    }
</style>
