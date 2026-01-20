<template>
  <div v-if="statusGroup !== 'UNKNOWN'" class="status-icon-wrapper">
    <b-badge
      :style="{ backgroundColor: statusColor, color: 'white' }"
      class="status-badge"
      :title="statusLabel"
      v-b-popover.hover="statusTooltip"
    >
      <i :class="statusIconClass" class="status-icon-inner"></i>
      {{ statusLabel }}
    </b-badge>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { IUCNStatusGroup } from '@/lib/utils';

interface Props {
  statusCode?: string;
  statusGroup?: string;
  statusColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  statusCode: undefined,
  statusGroup: 'UNKNOWN',
  statusColor: '#999999',
});

const { t } = useI18n();

const statusLabel = computed(() => {
  switch (props.statusGroup) {
    case IUCNStatusGroup.THREATENED:
      return t('status.threatened', 'Menacée');
    case IUCNStatusGroup.PROTECTED:
      return t('status.protected', 'Protégée');
    case IUCNStatusGroup.NOT_EVALUATED:
      return t('status.notThreatened', 'Non menacée');
    default:
      return '';
  }
});

const statusIconClass = computed(() => {
  switch (props.statusGroup) {
    case IUCNStatusGroup.THREATENED:
      return 'bi bi-exclamation-triangle-fill';
    case IUCNStatusGroup.PROTECTED:
      return 'bi bi-shield-exclamation';
    case IUCNStatusGroup.NOT_EVALUATED:
      return 'bi bi-check-circle-fill';
    default:
      return 'bi bi-question-circle';
  }
});

const statusTooltip = computed(() => {
  const codeLabel = getIUCNCodeLabel(props.statusCode);
  return `${codeLabel} (${props.statusCode})`;
});

function getIUCNCodeLabel(code: string | undefined): string {
  if (!code) return 'Unknown';
  const codeMap: Record<string, string> = {
    CR: t('status.code.CR', 'Critically Endangered'),
    EN: t('status.code.EN', 'Endangered'),
    VU: t('status.code.VU', 'Vulnerable'),
    NT: t('status.code.NT', 'Near Threatened'),
    DD: t('status.code.DD', 'Data Deficient'),
    LC: t('status.code.LC', 'Least Concern'),
    NE: t('status.code.NE', 'Not Evaluated'),
    NA: t('status.code.NA', 'Not Assessed'),
    EX: t('status.code.EX', 'Extinct'),
    EW: t('status.code.EW', 'Extinct in the Wild'),
  };
  return codeMap[code] || code;
}
</script>

<style scoped lang="scss">
.status-icon-wrapper {
  display: inline-block;
  margin: 0 4px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: help;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
}

.status-icon-inner {
  font-size: 1rem;
  line-height: 1;
}
</style>
