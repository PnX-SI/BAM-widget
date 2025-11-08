import { Media } from '../models';
import { MediaSource } from './MediaSource';

class UrlMediaSource extends MediaSource {
    private url: string;

    constructor(params) {
        super(params, null);
        // this.url = params.urlTemplate;
    }

    isCompatible(connector: any): boolean {
        return true;
    }

    fetchPicture(
        taxonID: string | number,
        connector: any
    ): Promise<Media[] | undefined> {
        const apiUrl = this.url.replace('{taxonID}', taxonID);
        return fetch(apiUrl)
            .then((response) => response.json())
            .then((data) => {
                const imageUrl = this.findImageUrlInResponse(data);
                if (!imageUrl) {
                    console.log(
                        "Aucune URL d'image trouvée dans la réponse de l'API."
                    );
                    return Promise.reject("Aucune URL d'image trouvée.");
                }
                console.log("URL de l'image trouvée :", imageUrl);
                return imageUrl;
            })
            .catch((error) => {
                console.error(
                    "Erreur lors de la récupération de l'URL de l'image :",
                    error
                );
                return Promise.reject(error);
            });
    }

    findImageUrlInResponse(data: any): string | null {
        if (typeof data === 'object' && data !== null) {
            for (const key in data) {
                if (key.includes('image') || key.includes('url')) {
                    const value = data[key];
                    if (
                        typeof value === 'string' &&
                        (value.endsWith('.jpg') ||
                            value.endsWith('.png') ||
                            value.endsWith('.jpeg') ||
                            value.includes('wikimedia'))
                    ) {
                        return value;
                    }
                } else if (
                    typeof data[key] === 'object' &&
                    data[key] !== null
                ) {
                    const nestedUrl = this.findImageUrlInResponse(data[key]);
                    if (nestedUrl) {
                        return nestedUrl;
                    }
                }
            }
        }
        return null;
    }
}
