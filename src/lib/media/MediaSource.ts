import { Connector } from '../connectors/connector';
import { Media } from '../models';
import { SOURCE_ } from './media';

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
        return new Promise((_) => null);
    }
}
