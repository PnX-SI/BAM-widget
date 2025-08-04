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
    <div
        v-if="loadingStatus"
        class="loading-container"
        data-testid="Loading component"
    >
        <div class="loading-card">
            <div class="spinner"></div>
            <h3 class="loading-text">{{ $t('loading') }}</h3>
        </div>
    </div>
</template>

<style scoped>
    .loading-container {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 60px 0;
    }

    .loading-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        background: #ffffff;
        border-radius: 18px;
        box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
        padding: 30px 50px;
        transition: all 0.3s ease;
        min-width: 220px;
    }

    .spinner {
        width: 46px;
        height: 46px;
        border: 4px solid #efefef;
        border-top-color: #afafaf;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 16px;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .loading-text {
        font-size: 1.2rem;
        font-weight: 600;
        color: #4a4a4a;
        letter-spacing: 0.5px;
        text-align: center;
    }
</style>
