<template>
    <div class="locale-changer input-group">
        <label for="languageSelect" class="input-group-text"
            ><i class="bi bi-translate"></i
        ></label>
        <select
            v-model="$i18n.locale"
            class="form-select"
            id="languageSelect"
            data-testid="Language select form"
        >
            <option
                v-for="locale in $i18n.availableLocales"
                :key="`locale-${locale}`"
                :value="locale"
            >
                {{ locale }}
            </option>
        </select>
    </div>
</template>

<style lang="css" scoped>
    .input-group {
        width: auto !important;
    }
</style>
