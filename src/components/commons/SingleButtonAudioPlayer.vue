<script setup lang="ts">
import { Media } from "@/lib/models";
import { ref } from "vue";
import Credits from "./Credits.vue";

const props = defineProps<{
  audio: Media;
}>();

const audio = new Audio(props.audio.url);
const play = ref(false);

audio.addEventListener("ended", (e) => {
  audio.currentTime = 0;
  play.value = false;
});

function toggleAudio() {
  if (play.value) {
    audio.pause();
    audio.currentTime = 0;
    play.value = false;
  } else {
    audio.play();
    play.value = true;
  }
}
</script>
<template>
  <BTooltip>
    <template #target>
      <i
        @click="toggleAudio()"
        :class="play ? 'bi bi-pause-circle' : 'bi bi-play-circle'"
      ></i>
    </template>
    <Credits :media="props.audio"></Credits>
  </BTooltip>
</template>
