<template>
  <div class="locale-changer">
    <select v-model="$i18n.locale" class="form-select">
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
