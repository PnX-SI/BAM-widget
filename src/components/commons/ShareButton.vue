<script setup>
    import { computed, ref } from 'vue';

    const link = computed(() => {
        return window.location.href;
    });

    const copied = ref(false);
    function copy() {
        navigator.clipboard.writeText(link.value);
        copied.value = true;
        setTimeout(() => {
            copied.value = false;
        }, 3000);
    }
</script>

<template>
    <button class="btn btn-outline-secondary" id="shareButton" @click="copy">
        <div v-if="copied">
            <i class="bi bi-check2-circle"></i> {{ $t('copied') }}!
        </div>
        <div v-else><i class="bi bi-link-45deg"></i> {{ $t('share') }}</div>
    </button>
</template>

<style>
    #shareButton {
        margin-left: 0.5em;
    }
    .share_modal {
        min-width: 400px !important;
    }
</style>
