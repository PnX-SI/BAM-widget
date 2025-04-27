<template>
  <div class="card small">
    <div class="card-header">
      <h5>{{ $t("howto") }}</h5>
    </div>
    <div
      class="card-body"
      style="overflow-y: scroll; height: 30vh"
      v-html="$t('intro')"
    ></div>
  </div>
</template>
