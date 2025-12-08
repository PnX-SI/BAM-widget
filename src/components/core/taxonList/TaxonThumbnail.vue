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
        description?: string;
    }>();

    const showModal = ref(false);

    const openModal = () => {
        showModal.value = true;
    };

    const closeModal = () => {
        showModal.value = false;
    };

    const sizeIcon = computed(() => {
        return isMobile.value ? 50 : 30;
    });
</script>
<template>
    <div class="col card thumbnail" data-testid="Taxon thumbnail view">
        <Image :image-url="props.picture?.url" :alt="props.picture?.url" />

        <FullScreenImage
            v-if="props.picture?.url"
            :media="props.picture"
            :alt="props.picture?.urlSource"
        >
            <div class="card-img-overlay">
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
                    <button
                        class="btn-plus"
                        @click.stop="openModal"
                        aria-label="Plus d'informations"
                    >
                        <i class="bi bi-plus-lg"></i>
                    </button>
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
        <!-- Modal -->
        <div v-if="showModal" class="modal-overlay" @click="closeModal">
            <div class="modal-container" @click.stop>
                <div class="modal-header">
                    <button
                        class="modal-close"
                        @click="closeModal"
                        aria-label="Fermer"
                    >
                        <i class="bi bi-x"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p v-if="props.description" class="modal-text">
                        {{ props.description }}
                    </p>
                    <a
                        :href="props.urlDetailPage"
                        target="_blank"
                        class="detail-link"
                    >
                        Voir la page détaillée →
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
    .card {
        border: 0;
        align-content: space-around;
        position: relative;
        overflow: hidden;
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
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .btn-plus {
        background: #efefef;
        backdrop-filter: blur(8px);
        border: none;
        color: #afafaf;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        line-height: 0;
        cursor: pointer;
        padding: 0;
        margin: 0;
        flex-shrink: 0;
    }

    .btn-plus:hover {
        background: rgba(255, 255, 255, 0.3);
    }

    .card-img-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 16px 20px;
        overflow: hidden;
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

    /* Modal Styles */
    .modal-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
        padding: 15px;
    }

    .modal-container {
        background: #fff;
        border-radius: 8px;
        width: 100%;
        max-height: 100%;
        display: flex;
        flex-direction: column;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    }

    .modal-header {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        padding: 10px;
        flex-shrink: 0;
        position: sticky;
        top: 0;
        z-index: 10;
    }

    .modal-close {
        background: rgba(255, 255, 255, 0.95);
        border: none;
        font-size: 28px;
        line-height: 0;
        color: #333;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        flex-shrink: 0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .modal-close:hover {
        background: #fff;
        color: #000;
    }

    .modal-body {
        padding: 15px;
        padding-top: 0;
        overflow-y: auto;
        flex: 1;
    }

    .modal-text {
        margin: 0 0 12px 0;
        color: #444;
        line-height: 1.5;
        font-size: 0.95rem;
    }

    .modal-text strong {
        color: #222;
    }

    .detail-link {
        display: inline-block;
        margin-top: 8px;
        color: #0066cc;
        text-decoration: none;
        font-weight: 500;
        font-size: 0.95rem;
    }

    .detail-link:hover {
        text-decoration: underline;
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

        .btn-plus {
            width: 40px;
            height: 40px;
            font-size: 24px;
        }

        .modal-overlay {
            padding: 30px;
        }

        .modal-text {
            font-size: 1.1rem;
        }

        .detail-link {
            font-size: 1.1rem;
        }
    }
</style>
