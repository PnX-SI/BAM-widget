import { test, expect, beforeEach } from '@playwright/test';
import { Connector, ConnectorOptions } from '../../src/lib/connectors/connector';
import { GbifConnector } from '../../src/lib/connectors/gbif';
import { IUCNStatusGroup } from '../../src/lib/utils';

test.describe('Connector Status Methods', () => {
    let connector: Connector;
    let gbifConnector: GbifConnector;

    test.beforeEach(() => {
        const options: ConnectorOptions = {};
        gbifConnector = new GbifConnector(options);
        connector = gbifConnector;
    });

    test('should have fetchTaxonStatus method', () => {
        expect(typeof connector.fetchTaxonStatus).toBe('function');
    });

    test('should have fetchDescription method', () => {
        expect(typeof connector.fetchDescription).toBe('function');
    });

    test('should have getStatusGroup method', () => {
        expect(typeof connector.getStatusGroup).toBe('function');
    });

    test('should return undefined for fetchTaxonStatus by default', async () => {
        const status = await connector.fetchTaxonStatus('test-id');
        expect(status).toBeUndefined();
    });

    test('should return undefined for fetchDescription by default', async () => {
        const description = await connector.fetchDescription('test-id', 'en');
        expect(description).toBeUndefined();
    });

    test('getStatusGroup should handle undefined status', () => {
        const result = connector.getStatusGroup(undefined);
        expect(result.group).toBe('UNKNOWN');
        expect(result.color).toBe('#999999');
    });

    test('getStatusGroup should map threatened codes correctly', () => {
        const result = connector.getStatusGroup('CR');
        expect(result.group).toBe(IUCNStatusGroup.THREATENED);
        expect(result.color).toBe('#E31E24');

        const result2 = connector.getStatusGroup('EN');
        expect(result2.group).toBe(IUCNStatusGroup.THREATENED);

        const result3 = connector.getStatusGroup('VU');
        expect(result3.group).toBe(IUCNStatusGroup.THREATENED);
    });

    test('getStatusGroup should map protected codes correctly', () => {
        const result = connector.getStatusGroup('NT');
        expect(result.group).toBe(IUCNStatusGroup.PROTECTED);
        expect(result.color).toBe('#F4A400');

        const result2 = connector.getStatusGroup('DD');
        expect(result2.group).toBe(IUCNStatusGroup.PROTECTED);
    });

    test('getStatusGroup should map not-evaluated codes correctly', () => {
        const result = connector.getStatusGroup('LC');
        expect(result.group).toBe(IUCNStatusGroup.NOT_EVALUATED);
        expect(result.color).toBe('#1ABA1C');

        const result2 = connector.getStatusGroup('NE');
        expect(result2.group).toBe(IUCNStatusGroup.NOT_EVALUATED);

        const result3 = connector.getStatusGroup('EX');
        expect(result3.group).toBe(IUCNStatusGroup.NOT_EVALUATED);
    });

    test('GBIF connector should have fetchTaxonStatus implementation', async () => {
        expect(typeof gbifConnector.fetchTaxonStatus).toBe('function');
    });

    test('should handle network errors gracefully', async () => {
        // Mock a failed request
        const status = await gbifConnector.fetchTaxonStatus('invalid-id-12345');
        expect(status).toBeUndefined();
    });
});
