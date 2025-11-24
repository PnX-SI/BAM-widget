<script setup>
    import ParameterStore from '@/lib/parameterStore';

    const { buffer } = ParameterStore.getInstance();
</script>

<template>
    <div class="row">
        <label for="buffer" class="form-label col-6"
            ><strong>
                {{ $t('bufferSize') }}
                <i class="fa-solid fa-up-right-and-down-left-from-center"></i
            ></strong>
        </label>
        <input
            type="number"
            class="form-number"
            min="1"
            max="3000"
            v-model="buffer"
            id="buffer"
            data-testid="Buffer selection form"
        />
    </div>
</template>
<style scoped>
    #buffer {
        width: 30%;
    }
</style>
