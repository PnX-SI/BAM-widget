<script setup>
import { computed } from "vue";

const props = defineProps({
  typeIcon: {
    type: String,
    default: "font-icon",
  },
  imageIcon: {
    type: String,
  },
  classIcon: {
    type: String,
  },
  backgroundColor: {
    type: String,
    default: "#aaa",
  },
  fontColor: {
    type: String,
    default: "#fff",
  },
  tooltip: {
    type: String,
    default: "",
  },
  id: {
    type: String,
    required: true,
  },
});

const style = computed(() => {
  return `background-color:${props.backgroundColor};color:${props.fontColor}`;
});
</script>
<template>
  <BTooltip>
    <template #target>
      <i
        v-if="props.typeIcon == 'font-icon'"
        class="badgeTaxon"
        :id="props.id"
        :style="style"
        :class="props.classIcon"
      ></i>
    </template>
    {{ props.tooltip }}
  </BTooltip>
</template>

<style>
.badgeTaxon {
  border-radius: 50%;
  padding: 0.5em;
  font-size: 1.5em;
}
.badgeTaxon img {
  max-width: 30px;
  max-height: 30px;
}
</style>
