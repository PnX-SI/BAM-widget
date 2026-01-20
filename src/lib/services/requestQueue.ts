/**
 * RequestQueue - Rate limiter pour éviter surcharger les APIs externes
 * Gère max 5 requêtes parallèles avec queue FIFO
 */

interface QueuedRequest {
    fn: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
}

export class RequestQueue {
    private maxConcurrent: number;
    private currentConcurrent: number = 0;
    private queue: QueuedRequest[] = [];
    private readonly timeout: number;

    constructor(maxConcurrent: number = 5, timeoutMs: number = 5000) {
        this.maxConcurrent = maxConcurrent;
        this.timeout = timeoutMs;
    }

    /**
     * Ajoute une requête à la queue et l'exécute quand possible
     * @param fn Fonction retournant une Promise
     * @returns Promise que la requête
     */
    async add<T>(fn: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            const queuedRequest: QueuedRequest = {
                fn: () =>
                    Promise.race([
                        fn(),
                        new Promise((_, rejectTimeout) =>
                            setTimeout(
                                () => rejectTimeout(new Error('Request timeout')),
                                this.timeout
                            )
                        ),
                    ]),
                resolve,
                reject,
            };

            this.queue.push(queuedRequest);
            this.processQueue();
        });
    }

    private async processQueue() {
        if (this.currentConcurrent >= this.maxConcurrent || this.queue.length === 0) {
            return;
        }

        this.currentConcurrent++;
        const queuedRequest = this.queue.shift();

        if (!queuedRequest) {
            this.currentConcurrent--;
            return;
        }

        try {
            const result = await queuedRequest.fn();
            queuedRequest.resolve(result);
        } catch (error) {
            queuedRequest.reject(error);
        } finally {
            this.currentConcurrent--;
            this.processQueue();
        }
    }

    /**
     * Retourne le nombre de requêtes en attente
     */
    getQueueSize(): number {
        return this.queue.length;
    }

    /**
     * Retourne le nombre de requêtes actuellement en cours
     */
    getConcurrentCount(): number {
        return this.currentConcurrent;
    }
}

// Instance globale partagée
export const globalRequestQueue = new RequestQueue(5, 5000);
