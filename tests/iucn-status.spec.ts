import { test, expect } from '@playwright/test';
import {
    groupIUCNStatus,
    getIUCNGroupColor,
    getIUCNGroupPriority,
    IUCNStatusGroup,
    IUCN_GROUPS,
} from '../../src/lib/utils';

test.describe('IUCN Status Grouping', () => {
    test('should map all 11 IUCN codes correctly', () => {
        // Threatened: CR, EN, VU
        expect(groupIUCNStatus('CR')).toBe(IUCNStatusGroup.THREATENED);
        expect(groupIUCNStatus('EN')).toBe(IUCNStatusGroup.THREATENED);
        expect(groupIUCNStatus('VU')).toBe(IUCNStatusGroup.THREATENED);

        // Protected: NT, DD
        expect(groupIUCNStatus('NT')).toBe(IUCNStatusGroup.PROTECTED);
        expect(groupIUCNStatus('DD')).toBe(IUCNStatusGroup.PROTECTED);

        // Not Evaluated: LC, NE, NA, EX, EW
        expect(groupIUCNStatus('LC')).toBe(IUCNStatusGroup.NOT_EVALUATED);
        expect(groupIUCNStatus('NE')).toBe(IUCNStatusGroup.NOT_EVALUATED);
        expect(groupIUCNStatus('NA')).toBe(IUCNStatusGroup.NOT_EVALUATED);
        expect(groupIUCNStatus('EX')).toBe(IUCNStatusGroup.NOT_EVALUATED);
        expect(groupIUCNStatus('EW')).toBe(IUCNStatusGroup.NOT_EVALUATED);
    });

    test('should handle lowercase codes', () => {
        expect(groupIUCNStatus('cr')).toBe(IUCNStatusGroup.THREATENED);
        expect(groupIUCNStatus('en')).toBe(IUCNStatusGroup.THREATENED);
        expect(groupIUCNStatus('vu')).toBe(IUCNStatusGroup.THREATENED);
        expect(groupIUCNStatus('nt')).toBe(IUCNStatusGroup.PROTECTED);
        expect(groupIUCNStatus('dd')).toBe(IUCNStatusGroup.PROTECTED);
    });

    test('should handle invalid codes', () => {
        expect(groupIUCNStatus('INVALID')).toBe(IUCNStatusGroup.UNKNOWN);
        expect(groupIUCNStatus('')).toBe(IUCNStatusGroup.UNKNOWN);
        expect(groupIUCNStatus(null)).toBe(IUCNStatusGroup.UNKNOWN);
        expect(groupIUCNStatus(undefined)).toBe(IUCNStatusGroup.UNKNOWN);
    });

    test('should return correct colors for groups', () => {
        expect(getIUCNGroupColor(IUCNStatusGroup.THREATENED)).toBe('#E31E24');
        expect(getIUCNGroupColor(IUCNStatusGroup.PROTECTED)).toBe('#F4A400');
        expect(getIUCNGroupColor(IUCNStatusGroup.NOT_EVALUATED)).toBe('#1ABA1C');
        expect(getIUCNGroupColor(IUCNStatusGroup.UNKNOWN)).toBe('#999999');
    });

    test('should return correct priorities for groups', () => {
        expect(getIUCNGroupPriority(IUCNStatusGroup.THREATENED)).toBe(1);
        expect(getIUCNGroupPriority(IUCNStatusGroup.PROTECTED)).toBe(2);
        expect(getIUCNGroupPriority(IUCNStatusGroup.NOT_EVALUATED)).toBe(3);
    });

    test('should have correct IUCN_GROUPS configuration', () => {
        const threatenedCodes = IUCN_GROUPS[IUCNStatusGroup.THREATENED].codes;
        const protectedCodes = IUCN_GROUPS[IUCNStatusGroup.PROTECTED].codes;
        const notEvaluatedCodes =
            IUCN_GROUPS[IUCNStatusGroup.NOT_EVALUATED].codes;

        expect(threatenedCodes).toContain('CR');
        expect(threatenedCodes).toContain('EN');
        expect(threatenedCodes).toContain('VU');
        expect(threatenedCodes.length).toBe(3);

        expect(protectedCodes).toContain('NT');
        expect(protectedCodes).toContain('DD');
        expect(protectedCodes.length).toBe(2);

        expect(notEvaluatedCodes).toContain('LC');
        expect(notEvaluatedCodes).toContain('NE');
        expect(notEvaluatedCodes).toContain('NA');
        expect(notEvaluatedCodes).toContain('EX');
        expect(notEvaluatedCodes).toContain('EW');
        expect(notEvaluatedCodes.length).toBe(5);
    });

    test('should have unique priorities', () => {
        const priorities = new Set();
        Object.values(IUCN_GROUPS).forEach((config) => {
            priorities.add(config.priority);
        });
        expect(priorities.size).toBe(3);
    });

    test('should not have duplicate codes across groups', () => {
        const allCodes: string[] = [];
        Object.values(IUCN_GROUPS).forEach((config) => {
            allCodes.push(...config.codes);
        });

        const uniqueCodes = new Set(allCodes);
        expect(uniqueCodes.size).toBe(allCodes.length);
    });
});
