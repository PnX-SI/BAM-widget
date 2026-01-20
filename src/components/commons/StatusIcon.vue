<template>
    <div v-if="statusGroup !== 'UNKNOWN'" class="status-icon-wrapper">
        <span
            class="status-badge"
            :style="{ backgroundColor: statusBg, color: '#fff' }"
            :title="statusLabel"
            v-b-popover.hover="statusTooltip"
            role="status"
        >
            <i
                :class="statusIconClass"
                class="status-icon-inner"
                aria-hidden="true"
            ></i>
            <span class="status-badge-label">{{ statusLabel }}</span>
        </span>
    </div>
</template>

<script setup lang="ts">
    import { computed } from 'vue';
    import { useI18n } from 'vue-i18n';
    import { IUCNStatusGroup, getIUCNColor } from '@/lib/utils';

    interface Props {
        statusCode?: string;
        statusGroup?: string;
        statusColor?: string;
    }

    const props = withDefaults(defineProps<Props>(), {
        statusCode: undefined,
        statusGroup: 'UNKNOWN',
        statusColor: undefined,
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

    const statusBg = computed(() => {
        if (props.statusColor) return props.statusColor;
        return getIUCNColor(
            props.statusCode,
            props.statusGroup as IUCNStatusGroup
        );
    });

    const statusTextColor = computed(() => getContrastColor(statusBg.value));

    function getContrastColor(hex: string): string {
        if (!hex) return '#ffffff';
        const clean = hex.replace('#', '');
        const r = parseInt(clean.substring(0, 2), 16);
        const g = parseInt(clean.substring(2, 4), 16);
        const b = parseInt(clean.substring(4, 6), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.6 ? '#000000' : '#ffffff';
    }

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

<style scoped>
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
    }

    .status-badge:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .status-icon-inner {
        font-size: 1rem;
        line-height: 1;
    }
</style>
