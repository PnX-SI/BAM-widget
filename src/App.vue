<script setup>
    import { useI18n } from 'vue-i18n';
    const { t, locale } = useI18n();
    import { watch } from 'vue';

    // Set title
    document.title = t('title');

    // Watch for language change
    watch(locale, () => {
        document.title = t('title');
    });
</script>

<template>
    <RouterView />
</template>

<style scoped></style>
