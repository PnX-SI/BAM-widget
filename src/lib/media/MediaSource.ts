import { Connector } from '../connectors/connector';
import { Media } from '../models';
import { SOURCE_ } from './media';

/** Media of several taxa, keyed by `String(taxonID)`. */
export type MediaBatch = Map<string, Media[]>;

export abstract class MediaSource {
    name: string;
    id: SOURCE_;

    constructor(name: string, id: SOURCE_) {
        this.name = name;
        if (!Object.values(SOURCE_).includes(id)) {
            throw new Error(
                'Source identifier is not declared in `mediaIdentifier.js`'
            );
        }
        this.id = id;
    }

    abstract isCompatible(connector: Connector): boolean;

    fetchPicture(
        taxonID: string | number,
        connector: Connector
    ): Promise<Media[] | undefined> {
        if (!this.isCompatible(connector)) {
            throw new Error('This media source is not available!');
        }
        throw new Error('Not implemented');
    }

    fetchSound(
        taxonID: string | number,
        connector: Connector
    ): Promise<Media[] | undefined> {
        if (!this.isCompatible(connector)) {
            throw new Error('This media source is not available!');
        }
        // no sound for this source: resolve instead of staying pending
        return Promise.resolve([]);
    }

    /**
     * Pictures of several taxa at once. Sources that can answer in bulk
     * override this; the default calls `fetchPicture` for each taxon. A taxon
     * that fails gets an empty list instead of failing the whole batch.
     */
    fetchPictures(
        taxonIDs: Array<string | number>,
        connector: Connector
    ): Promise<MediaBatch> {
        return this.fetchEach(taxonIDs, (id) =>
            this.fetchPicture(id, connector)
        );
    }

    /** Sounds of several taxa at once, see `fetchPictures`. */
    fetchSounds(
        taxonIDs: Array<string | number>,
        connector: Connector
    ): Promise<MediaBatch> {
        return this.fetchEach(taxonIDs, (id) => this.fetchSound(id, connector));
    }

    private fetchEach(
        taxonIDs: Array<string | number>,
        fetchOne: (id: string | number) => Promise<Media[] | undefined>
    ): Promise<MediaBatch> {
        const ids = [...new Set(taxonIDs.map(String))];
        return Promise.all(
            ids.map((id) =>
                Promise.resolve()
                    .then(() => fetchOne(id))
                    .then((medias) => medias ?? [])
                    .catch(() => [] as Media[])
            )
        ).then((results) => new Map(ids.map((id, i) => [id, results[i]])));
    }
}
