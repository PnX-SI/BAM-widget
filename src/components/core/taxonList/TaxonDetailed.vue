<script setup lang="ts">
    import Credits from '@/components/commons/Credits.vue';
    import { Media } from '@/lib/models';
    import { ref, useTemplateRef } from 'vue';

    const props = defineProps<{
        picture: Media;
        audio: Media;
        vernacularName: string;
        acceptedScientificName: string;
        urlDetailPage: string;
        nbObservations: number;
        lastSeenDate: Date;
        description?: string;
    }>();

    const descriptionShown = ref(false);
    function toggleDescription() {
        descriptionShown.value = !descriptionShown.value;
    }
</script>
<template>
    <div class="col" data-testid="Taxon detailed view">
        <div class="card h-100 mb-2">
            <div class="taxon-photo" data-testid="Taxon picture">
                <FullScreenImage
                    :media="props.picture"
                    :alt="props.picture?.urlSource"
                >
                    <Image
                        :image-url="props.picture?.url"
                        :alt="props.picture?.urlSource"
                        class="card-img-top"
                    ></Image>
                </FullScreenImage>

                <div
                    class="caption"
                    v-if="props.picture.author"
                    data-testid="Picture caption"
                >
                    <Credits
                        link-color="link-light"
                        :media="props.picture"
                        class=""
                    ></Credits>
                </div>
            </div>

            <div class="card-body">
                <div class="card-text">
                    <h5
                        class="card-title text-wrap"
                        data-testid="Vernacular name"
                    >
                        {{ props.vernacularName }}
                    </h5>
                    <small
                        class="text-body-secondary"
                        data-testid="Scientific name"
                        ><strong>{{ $t('taxon.scientificName') }} :</strong>
                        {{ props.acceptedScientificName }}</small
                    ><br />

                    <small
                        v-if="props.nbObservations"
                        class="text-body-secondary"
                    >
                        <strong>{{ $t('taxon.nbObservations') }} : </strong
                        ><span data-testid="Number of observations">{{
                            props.nbObservations
                        }}</span>
                    </small>
                    <br />
                    <small
                        class="text-body-secondary"
                        data-testid="Description"
                        v-if="description"
                    >
                        <strong
                            >Description
                            <button
                                class="description-button"
                                @click="toggleDescription"
                            >
                                +
                            </button></strong
                        >

                        <span
                            class="description"
                            :class="{ active: descriptionShown }"
                        >
                            {{ description }}
                        </span>
                    </small>

                    <br />

                    <small class="text-body-secondary">
                        <!-- prettier-ignore -->
                        <a
              :href="props.urlDetailPage"
              target="_blank"
              data-testid="Taxon detail redirect link"
              class="badge bg-light text-secondary border border-secondary text-decoration-none"
              ><strong>{{ $t("taxon.learnMore") }} <i class="bi bi-arrow-right"></i> </strong>
            </a>
                    </small>
                    <br />

                    <AudioPlayer
                        v-if="props.audio?.url"
                        :audio="props.audio"
                        variant="player"
                    />
                </div>
            </div>
            <div class="card-footer">
                <small class="text-body-secondary" data-testid="Last seen date"
                    >{{ $t('taxon.lastSeenDate') }} :
                    {{ props?.lastSeenDate.toLocaleDateString() }}</small
                >
            </div>
        </div>
    </div>
</template>

<style scoped>
    .taxon-photo {
        position: relative;
        display: inline-block;
    }

    .taxon-photo > img {
        object-fit: cover;
        height: 250px !important;
        border-radius: 0px !important;
        width: 100%;
    }

    .caption {
        position: absolute;
        bottom: 0px;
        left: 0px;
        width: 100%;
        color: white;
        background-color: rgba(0, 0, 0, 0.5);
        padding: 5px;
        border-radius: 3px;
    }

    .audio {
        margin-top: 0.5rem;
        width: 100%;
    }
    .description {
        display: none;
    }
    .description.active {
        display: block;
        transform: fadeIn 1s ease;
    }
    .description-button {
        background-color: #efefef;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
    }
</style>
