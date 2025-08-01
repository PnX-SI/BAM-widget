<script setup lang="">
import { Media } from "@/lib/models";
import { useTemplateRef, ref } from "vue";

const props = defineProps({
  audio: { type: Media, required: true },
});

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
  <i
    @click="toggleAudio()"
    :class="play ? 'bi bi-pause-circle' : 'bi bi-play-circle'"
  ></i>
</template>
