<script setup>
import { Media } from "@/lib/models";
import { useTemplateRef, ref } from "vue";

const props = defineProps({
  audio: { type: Media, required: true },
});

const audio = useTemplateRef("audio");
const play = ref(false);

function toggle() {
  if (play.value) {
    audio.value.pause();
    play.value = false;
  } else {
    audio.value.play();
    play.value = true;
  }
}
</script>
<template>
  <i
    @click="toggle()"
    :class="play ? 'bi bi-pause-circle' : 'bi bi-play-circle'"
  ></i>
  <audio
    controls
    ref="audio"
    style="display: none"
    :src="props.audio.url"
  ></audio>
</template>
