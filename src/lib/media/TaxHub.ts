import { MediaSource } from './MediaSource';
import { SOURCE_ } from './media';
import { CONNECTORS } from '../connectors/connectors';

function isUrlImage(url: string): boolean {
    const imageFormats = ['jpg', 'png', 'gif', 'bmp', 'jpeg'];
    return imageFormats.some((format) => url.endsWith(format));
}

interface TypeMedia {
    desc_type_media: string;
    id_type: number;
    nom_type_media: string;
}

interface MediaTaxHub {
    auteur: string;
    cd_ref: number;
    chemin: string;
    desc_media: string;
    id_media: number;
    id_type: number;
    is_public: boolean;
    licence: string;
    media_url: string;
    source: string;
    titre: string;
    url: string;
}

export class TaxHubMediaSource extends MediaSource {
    type: number | null = null;

    constructor(parameters: any) {
        super('TaxHub', SOURCE_.taxhub);
        this.type = null;
    }

    fetchTypeMedia(connector: any): Promise<number | null> {
        if (this.type !== null) {
            return Promise.resolve(this.type);
        }

        return fetch(`${connector.API_ENDPOINT}/taxhub/api/tmedias/types`)
            .then((response) => response.json())
            .then((types: TypeMedia[]) => {
                const type = types.find(
                    (type) => type.nom_type_media === 'Photo_principale'
                );
                this.type = type ? type.id_type : -1;
                return this.type;
            })
            .catch((error) => {
                console.error('Failed to fetch media types:', error);
                this.type = -1;
                return this.type;
            });
    }

    fetchPicture(taxonID: string | number, connector: any): Promise<any[]> {
        return this.fetchTypeMedia(connector).then((type) => {
            const url = `${connector.API_ENDPOINT}/taxhub/api/taxref/${taxonID}?fields=medias`;
            return fetch(url)
                .then((response) => response.json())
                .then((json) => {
                    const medias = Object.values(json?.medias || {});

                    let filteredMedias = medias;
                    if (type !== null && type !== -1) {
                        filteredMedias = filteredMedias.filter(
                            (media: MediaTaxHub) => media.id_type === type
                        );
                    }

                    if (filteredMedias.length === 0) {
                        filteredMedias = medias;
                    }

                    return filteredMedias
                        .filter(
                            (media: MediaTaxHub) =>
                                media.is_public && isUrlImage(media.media_url)
                        )
                        .map((media: MediaTaxHub) => ({
                            url: media.media_url,
                            license: media.licence ?? media.auteur,
                            source: media.auteur,
                            typeMedia: 'image',
                            author: media.auteur,
                            urlSource: media.url,
                        }));
                })
                .catch((error) => {
                    console.error('Failed to fetch picture:', error);
                    return [];
                });
        });
    }

    isCompatible(connector: any): boolean {
        return connector.name === CONNECTORS.GeoNature;
    }
}
