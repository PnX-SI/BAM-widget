<script setup>
import { taxonClassIcons } from "@/assets/taxonclass2icon";
import { ref } from "vue";

const class_ = ref(null);

function updateClass(className) {
  class_.value = class_.value == className ? null : className;
  emit("select:class", class_.value);
}

const emit = defineEmits(["select:class"]);
</script>

<template>
  <BTooltip>
    <template #target>
      <BDropdown
        variant="secondary"
        strategy="fixed"
        data-testid="Filter results by class button"
      >
        <template #button-content>
          <i class="bi bi-funnel"></i>
        </template>
        <BDropdownItem
          v-for="value of Object.keys(taxonClassIcons.Animalia)"
          :key="value"
          @click="updateClass(value)"
          :active="class_ == value"
          data-testid="Animalia results filter"
          >{{ $t(`taxonsClass.Animalia.${value}`) }}</BDropdownItem
        >
        <!-- :active="value == class_.value" -->
        <BDropdownItem
          v-for="value of Object.keys(taxonClassIcons.Plantae)"
          data-testid="Plantae results filter"
          :key="value"
          @click="updateClass(value)"
          :active="class_ == value"
          >{{ $t(`taxonsClass.Plantae.${value}`) }}</BDropdownItem
        >
      </BDropdown>
    </template>
    {{ $t("taxon.classFilter") }}
  </BTooltip>
</template>
