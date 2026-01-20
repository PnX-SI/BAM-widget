<script setup lang="ts">
    import { Media, StatusInfo } from '@/lib/models';
    import { computed, onMounted, ref, watch } from 'vue';
    import ParameterStore from '@/lib/parameterStore';
    import StatusIcon from '@/components/commons/StatusIcon.vue';

    const { isMobile } = ParameterStore.getInstance();

    const props = defineProps<{
        picture: Media;
        audio: Media;
        vernacularName: string;
        acceptedScientificName: string;
        urlDetailPage: string;
        status?: StatusInfo | null;
        description?: string;
    }>();

    const sizeIcon = computed(() => {
        return isMobile.value ? 50 : 30;
    });
</script>

<template>
    <div class="col card thumbnail" data-testid="Taxon thumbnail view">
        <FullScreenImage
            v-if="props.picture?.url"
            :media="props.picture"
            :alt="props.picture?.urlSource"
        >
            <img
                :src="props.picture?.url"
                :alt="props.picture?.urlSource"
                class="card-img"
            />
            <div class="card-img-overlay">
                <div class="card-title">
                    <div class="title-header">
                        <a
                            style="color: inherit; text-decoration: inherit"
                            :href="props.urlDetailPage"
                            target="_blank"
                        >
                            <span class="vernacularName">{{
                                props.vernacularName
                            }}</span>
                        </a>
                        <StatusIcon
                            v-if="props.status"
                            :status-code="props.status.code"
                            :status-group="props.status.group"
                            :status-color="props.status.color"
                        />
                    </div>
                </div>

                <!-- Bottom Controls (audio + copyright) -->
                <div class="bottom-controls">
                    <div class="player">
                        <AudioPlayer
                            v-if="props.audio"
                            :audio="props.audio"
                            variant="button"
                            :size="sizeIcon"
                        />
                    </div>

                    <Popover
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
                        <Credits
                            link-color="link-dark"
                            :media="props.picture"
                        />
                    </Popover>
                </div>
            </div>
        </FullScreenImage>
    </div>
</template>

<style scoped>
    .card {
        border: 0;
        align-content: space-around;
        position: relative;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
        transition: box-shadow 0.3s ease, transform 0.3s ease;
        overflow: hidden;
    }

    .card:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12),
            0 2px 4px rgba(0, 0, 0, 0.08);
        transform: translateY(-2px);
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

    .title-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 8px;
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
        font-size: 1rem;
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

    @media screen and (max-width: 1200px) {
        .card-title span {
            font-size: 1rem;
        }
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
