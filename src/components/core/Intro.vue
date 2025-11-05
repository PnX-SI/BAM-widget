<template>
    <div id="intro">
        <h2>{{ $t('introTitle') }}</h2>
        <VueShowdown
            :markdown="$t('intro')"
            flavor="github"
            :options="{ emoji: true }"
        />
    </div>
</template>
<style>
    #intro {
        padding: 1em;
        background-color: #198754;
        border-radius: 2%;
        color: white;
    }
</style>
