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
    <div class="row justify-content-center p-3">
        <div
            class="col-12 col-lg-12 col-md-6 d-flex justify-content-center align-items-center"
        >
            <label for="shareButton" class="mb-0 me-2 fw-bold">{{
                $t('shareDiscover')
            }}</label>
            <button
                class="btn btn-outline-secondary"
                id="shareButton"
                @click="copy"
                aria-label="Share button"
            >
                <div v-if="copied">
                    <i class="bi bi-check2-circle"></i> {{ $t('copied') }}!
                </div>
                <div v-else>
                    <i class="bi bi-link-45deg"></i> {{ $t('copy') }}
                </div>
            </button>
        </div>
    </div>
</template>

<style>
    #shareButton {
        margin-left: 0.5em;
    }
    .share_modal {
        min-width: 400px !important;
    }
</style>
