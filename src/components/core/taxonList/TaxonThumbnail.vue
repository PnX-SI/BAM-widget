<script setup lang="ts">
    import { Media } from '@/lib/models';
    import { computed, onMounted, ref, watch } from 'vue';
    import ParameterStore from '@/lib/parameterStore';

    const { isMobile } = ParameterStore.getInstance();

    const props = defineProps<{
        picture: Media;
        audio: Media;
        vernacularName: string;
        acceptedScientificName: string;
        urlDetailPage: string;
    }>();

    const sizeIcon = computed(() => {
        return isMobile.value ? 50 : 30;
    });
</script>

<template>
    <div class="col card thumbnail" data-testid="Taxon thumbnail view">
        <Image
            :image-url="props.picture?.url"
            :alt="props.picture?.url"
            :title="'Source: ' + props.picture?.source"
            class="card-img"
        />

        <div class="card-img-overlay">
            <!-- Title (now at the top) -->
            <div class="card-title">
                <a
                    style="color: inherit; text-decoration: inherit"
                    :href="props.urlDetailPage"
                    target="_blank"
                >
                    <span class="vernacularName">{{
                        props.vernacularName
                    }}</span>
                </a>
            </div>

            <!-- Bottom Controls (audio + copyright) -->
            <div class="bottom-controls">
                <div class="player">
                    <SingleButtonAudioPlayer
                        v-if="props.audio"
                        :audio="props.audio"
                        :size="sizeIcon"
                    />
                </div>

                <BPopover
                    v-if="props.picture.source"
                    :click="true"
                    :close-on-hide="true"
                    :delay="{ show: 0, hide: 0 }"
                >
                    <template #target>
                        <div class="copyright-icon">
                            <i
                                class="bi bi-c-square-fill"
                                :style="{
                                    fontSize: sizeIcon + 'px',
                                }"
                            ></i>
                        </div>
                    </template>
                    <Credits link-color="link-dark" :media="props.picture" />
                </BPopover>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .card {
        border: 0;
        align-content: space-around;
        position: relative;
    }

    .card-img {
        object-fit: cover;
        width: 100%;
        aspect-ratio: 1/1;
        display: block;
    }

    .card-title {
        color: #fff;
        font-size: 1rem;
        font-weight: 600;
        z-index: 2;
    }

    /* Overlay covers the image */
    .card-img-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 16px 20px;
    }

    .vernacularName {
        text-shadow: 0 2px 6px rgba(0, 0, 0, 0.7);
        font-size: 1.4rem;
        font-weight: 600;
    }

    .bottom-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .player,
    .copyright-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
    }

    .copyright-icon i {
        color: #fff;
        line-height: 1;
    }

    /* --- Mobile --- */
    @media screen and (max-width: 768px) {
        .card-title span {
            font-size: 2rem;
        }

        .bottom-controls {
            padding: 0 5px;
        }
    }
</style>
