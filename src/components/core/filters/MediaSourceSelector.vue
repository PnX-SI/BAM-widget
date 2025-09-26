<script setup>
    import ParameterStore from '@/lib/parameterStore';
    import { ref, watch } from 'vue';
    import { getMediaSource } from '@/lib/media/media';
    import { MediaType } from '@/lib/models';
    const { connector } = ParameterStore.getInstance();

    const props = defineProps({
        mediaSourceID: {
            type: String,
            required: true,
        },
        typeMedia: {
            type: MediaType,
            required: true,
        },
    });

    const mediaSourceID = ref(props.mediaSourceID);

    // watchEffect();
    watch(
        connector,
        () => {
            mediaSourceID.value = props.mediaSourceID;
        },
        { deep: false }
    );

    watch(mediaSourceID, () => {
        const otherMediaKey = `${
            props.typeMedia === MediaType.image
                ? MediaType.sound
                : MediaType.image
        }Source`;
        const newMediaParams = {
            [props.typeMedia + 'Source']: getMediaSource(mediaSourceID.value),
            [otherMediaKey]: getMediaSource(connector.value[otherMediaKey].id),
        };
        connector.value = new connector.value.constructor(
            Object.assign({}, connector.value.getParams(), newMediaParams)
        );
    });
</script>
<template>
    <label for="mediaSourceSelect"
        ><strong>
            {{ $t(`media.${typeMedia}`) }}
            <i class="fa-solid fa-photo-film"></i> </strong
    ></label>
    <BFormSelect
        id="mediaSourceSelect"
        :options="connector.getCompatibleMediaSource()"
        v-model="mediaSourceID"
    >
        <template #first>
            <BFormSelectOption :value="null" disabled>{{
                $t('media.select')
            }}</BFormSelectOption>
        </template>
    </BFormSelect>
</template>
