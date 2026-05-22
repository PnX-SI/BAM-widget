<script setup lang="ts">
    import { Media } from '@/lib/models';
    import { computed } from 'vue';

    const props = defineProps<{
        media: Media;
        linkColor?: string;
        class?: string;
    }>();

    const STRING_LIMIT = 200;

    const creditsLicense = computed(() => {
        if (props.media.license && props.media.license.length > STRING_LIMIT) {
            return props.media.license.slice(0, STRING_LIMIT);
        }
        return props.media.license;
    });

    const creditsAuthor = computed(() => {
        if (props.media.author && props.media.author.length > STRING_LIMIT) {
            return props.media.author.slice(0, STRING_LIMIT);
        }
        return props.media.author;
    });
</script>

<template>
    <div :class="props.class">
        <!-- :class="props.linkColor ? props.linkColor : 'link-light'" -->
        <span v-if="props.media.urlSource"
            ><a :href="props.media.urlSource" target="_blank">{{
                creditsAuthor
            }}</a></span
        >
        <span v-else>{{ creditsAuthor }}</span>
        <span v-if="creditsLicense && creditsAuthor"> - </span>
        <!-- :class="props.linkColor ? props.linkColor : 'link-light'" -->
        <span v-if="props.media.licenseUrl"
            ><a
                :href="props.media.licenseUrl"
                target="_blank"
                style="margin-left: 0.3em"
                >{{ creditsLicense }}</a
            ></span
        >
        <span v-else>{{ creditsLicense }}</span>
    </div>
</template>
<style scoped>
    span {
        margin-right: 0.2em;
    }
    a {
        color: inherit;
    }
</style>
