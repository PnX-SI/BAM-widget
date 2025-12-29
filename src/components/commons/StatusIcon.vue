<script setup>
    const props = defineProps({
        status: String,
        color: String,
        size: {
            type: String,
            default: '30px',
        },
    });
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
        {{ $t('IUCNStatus.' + props.status) }}
    </BPopover>
</template>

<style>
    .status-btn {
        border: 1px solid #fff;
        border-radius: 50%;
    }
</style>
