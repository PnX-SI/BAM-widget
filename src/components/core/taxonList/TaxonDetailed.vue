<script setup lang="ts">
    import Credits from '@/components/commons/Credits.vue';
    import StatusIcon from '@/components/commons/StatusIcon.vue';
    import { Media, StatusInfo } from '@/lib/models';
    import { ref, computed } from 'vue';

    const props = defineProps<{
        picture: Media;
        audio: Media;
        vernacularName: string;
        acceptedScientificName: string;
        urlDetailPage: string;
        nbObservations: number;
        lastSeenDate: Date;
        status?: StatusInfo | null;
        description?: string;
        taxonId: string | number;
    }>();

    const showDescriptionModal = ref(false);
    const modalId = computed(() => `description-modal-${props.taxonId}`);
    const modalRef = ref<any>(null);

    function openDescriptionModal() {
        if (modalRef.value) {
            modalRef.value.show();
        }
    }
</script>
<template>
    <div class="col detailed" data-testid="Taxon detailed view">
        <div class="card h-100 mb-2">
            <!-- Circular Image with Audio Overlay -->
            <div class="image-container">
                <!-- Status Badge above image -->
                <div
                    v-if="props.status && props.status.group !== 'UNKNOWN'"
                    class="status-above-image"
                >
                    <StatusIcon
                        :status-code="props.status.code"
                        :status-group="props.status.group"
                        :status-color="props.status.color"
                    />
                </div>

                <FullScreenImage
                    :media="props.picture"
                    :alt="props.picture?.urlSource"
                >
                    <img
                        :src="props.picture?.url"
                        :alt="props.picture?.urlSource"
                        class="circular-image"
                        data-testid="Taxon picture"
                    />
                </FullScreenImage>

                <!-- Audio Player Overlay -->
                <AudioPlayer
                    v-if="props.audio?.url"
                    :audio="props.audio"
                    variant="button"
                    :size="45"
                    class="audio-overlay"
                />
            </div>

            <div class="card-body">
                <!-- Taxon Names -->
                <div class="names">
                    <strong class="vernacular-name">{{
                        props.vernacularName
                    }}</strong>
                    <em class="scientific-name">{{
                        props.acceptedScientificName
                    }}</em>
                </div>

                <!-- Statistics Section -->
                <div class="statistics-wrapper">
                    <div class="statistics">
                        <small class="text-body-secondary">{{
                            $t('taxon.lastSeenDate')
                        }}</small>
                        <strong>{{
                            props?.lastSeenDate.toLocaleDateString()
                        }}</strong>
                    </div>
                    <div v-if="props.nbObservations" class="statistics">
                        <small class="text-body-secondary">{{
                            $t('taxon.nbObservations')
                        }}</small>
                        <strong>{{ props.nbObservations }}</strong>
                    </div>
                </div>

                <!-- Description Button -->
                <div
                    v-if="props.description"
                    class="description-button-wrapper"
                >
                    <BButton
                        @click="openDescriptionModal"
                        variant="outline-secondary"
                        size="sm"
                        class="w-100"
                        data-testid="Show description button"
                    >
                        <i class="bi bi-info-circle"></i>
                        {{ $t('taxon.description') }}
                    </BButton>
                </div>

                <!-- Action Links -->
                <div class="actions">
                    <a
                        :href="props.urlDetailPage"
                        target="_blank"
                        class="badge bg-light text-secondary border border-secondary text-decoration-none"
                        data-testid="Taxon detail redirect link"
                    >
                        <strong
                            >{{ $t('taxon.learnMore') }}
                            <i class="bi bi-arrow-right"></i
                        ></strong>
                    </a>
                </div>
            </div>

            <!-- Credits Section -->
            <div class="credits">
                <div class="credits-header">
                    <h6 class="mb-0">
                        <i class="bi bi-link-45deg"></i>
                        {{ $t('taxon.credits') }}
                    </h6>
                </div>
                <div v-if="props.audio?.source" class="subcredits">
                    <i class="bi bi-music-note-beamed"></i>
                    <Credits :media="props.audio" link-color="link-dark" />
                </div>
                <div v-if="props.picture?.source" class="subcredits">
                    <i class="bi bi-camera"></i>
                    <Credits :media="props.picture" link-color="link-dark" />
                </div>
            </div>
        </div>

        <!-- Description Modal -->
        <BModal
            :id="modalId"
            ref="modalRef"
            :title="props.vernacularName"
            centered
            scrollable
        >
            <div class="description-content" v-html="props.description"></div>
        </BModal>
    </div>
</template>

<style scoped>
    .detailed {
        container-name: detailed;
        container-type: inline-size;
        box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);
    }

    /* Image Container with Circular Image */
    .image-container {
        margin-top: 1em;
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 2em;
    }

    /* Status above image */
    .status-above-image {
        position: relative;
        width: 100%;
        display: flex;
        justify-content: center;
        margin-bottom: 0.5em;
        z-index: 10;
    }

    .circular-image {
        display: flex;
        width: 150px;
        height: 150px;
        aspect-ratio: 1;
        object-fit: cover;
        border-radius: 50%;
        box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
    }

    /* Audio Player Overlay */
    .audio-overlay {
        position: absolute;
        bottom: 0px;
        left: 50%;
        transform: translateX(-50%) translateY(50%);
        z-index: 2;
    }

    /* Taxon Names */
    .names {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        margin-bottom: 0.5em;
    }

    .vernacular-name {
        font-size: 1.3rem;
        color: #333;
        line-height: 1.3;
    }

    .scientific-name {
        font-size: 0.9rem;
        color: #999;
        font-style: italic;
    }

    /* Statistics Section */
    .statistics-wrapper {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin-top: 1em;
        margin-bottom: 1em;
        column-gap: 0.5em;
    }

    .statistics {
        display: flex;
        flex-direction: column;
        align-items: center;
        color: #666;
        text-align: center;
        background-color: rgba(239, 239, 239, 0.5);
        padding: 1em;
        border-radius: 5px;
        flex: 1;
        font-size: 0.9rem;
    }

    .statistics small {
        font-weight: normal;
        margin-bottom: 0.3em;
    }

    .statistics strong {
        font-size: 1.1rem;
        color: #333;
    }

    /* Description Button */
    .description-button-wrapper {
        margin: 0.5em 0 1em 0;
    }

    /* Actions */
    .actions {
        display: flex;
        justify-content: center;
        gap: 0.5em;
        margin-bottom: 1em;
    }

    /* Credits Section */
    .credits {
        padding: 1em;
        border-top: 1px solid rgba(0, 0, 0, 0.05);
        background-color: rgba(239, 239, 239, 0.2);
    }

    .credits-header {
        display: flex;
        align-items: center;
        gap: 0.5em;
        color: #666;
        margin-bottom: 0.8em;
    }

    .credits-header h6 {
        font-size: 0.9rem;
        font-weight: 600;
    }

    .subcredits {
        display: flex;
        align-items: center;
        gap: 0.5em;
        font-size: 0.85rem;
        color: #666;
        margin-left: 1em;
        margin-bottom: 0.5em;
    }

    .subcredits i {
        color: #999;
        min-width: 1em;
    }

    /* Description Content */
    .description-content {
        line-height: 1.6;
        color: #333;
        font-size: 0.95rem;
    }

    .description-content :deep(p) {
        margin-bottom: 1rem;
    }

    .description-content :deep(strong) {
        font-weight: 600;
    }

    /* Container Queries for Responsive Design */
    @container detailed (width < 275px) {
        .statistics-wrapper {
            flex-direction: column;
            row-gap: 0.5em;
        }

        .statistics {
            width: 100%;
        }

        .circular-image {
            width: 120px;
            height: 120px;
        }

        .vernacular-name {
            font-size: 1.1rem;
        }
    }

    /* Mobile Optimization */
    @media (max-width: 576px) {
        .statistics-wrapper {
            flex-direction: column;
            row-gap: 0.5em;
        }

        .statistics {
            width: 100%;
        }

        .circular-image {
            width: 130px;
            height: 130px;
        }

        .card-body {
            padding: 1rem;
        }

        .credits {
            padding: 0.75em;
        }
    }
</style>
