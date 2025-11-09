<script setup>
    import { ref, watch } from 'vue';

    const props = defineProps({
        loadingStatus: Boolean,
    });

    const loadingStatus = ref(
        props.loadingStatus != null ? props.loadingStatus : false
    );

    watch(
        () => props.loadingStatus,
        (newVal) => {
            loadingStatus.value = newVal;
        }
    );
</script>

<template>
    <div v-if="loadingStatus" class="loading-container">
        <div class="loading-card">
            <div class="spinner"></div>
            <h3 class="loading-text">{{ $t('loading') }}...</h3>
        </div>
    </div>
</template>

<style scoped>
    /* Background overlay (optional, subtle) */
    .loading-container {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 60px 0;
    }

    /* Main loading box */
    .loading-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        background: #ffffff;
        border-radius: 18px;
        box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
        padding: 30px 50px;
        transition: all 0.3s ease;
        min-width: 220px;
    }

    /* Spinner animation */
    .spinner {
        width: 46px;
        height: 46px;
        border: 4px solid #e3e3e3;
        border-top-color: #4a90e2;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 16px;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    /* Loading text */
    .loading-text {
        font-size: 1.2rem;
        font-weight: 600;
        color: #4a4a4a;
        letter-spacing: 0.5px;
        text-align: center;
    }
</style>
