<script setup>
    import ParameterStore from '@/lib/parameterStore';
    import { ref } from 'vue';
    const props = defineProps({
        status: String,
        color: String,
        size: {
            type: String,
            default: '30px',
        },
    });
    const { lang } = ParameterStore.getInstance();
    const linkIUCN = ref(
        `https://${lang.value}.wikipedia.org/wiki/IUCN_Red_List`
    );
</script>

<template>
    <!-- test -->
    <BPopover :delay="{ show: 0, hide: 0 }" :close-on-hide="true">
        <template #target>
            <div
                class="status-btn"
                :style="{
                    backgroundColor: props.color,
                    color: props.status == 'NE' ? '#666' : '#ffffff',
                    width: props.size,
                    height: props.size,
                }"
            ></div>
        </template>
        <strong style=""
            ><a :href="linkIUCN">{{
                $t('globalConservationStatus')
            }}</a></strong
        ><br />
        {{ $t('IUCNStatus.' + props.status) }}
    </BPopover>
</template>

<style>
    .status-btn {
        border: 1px solid #bfbfbf;
        border-radius: 50%;
        aspect-ratio: 1;
    }
</style>
