/**
 * Format a date relative to today with threshold labels
 * Examples: "Aujourd'hui", "Hier", "< 1 mois", "< 1 an", "< 2 ans"
 */
export function formatRelativeDate(date: Date): string {
    const today = new Date();
    const diff = today.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
        return 'Aujourd\'hui';
    }

    if (days === 1) {
        return 'Hier';
    }

    if (days < 30) {
        return '< 1 mois';
    }

    const months = Math.floor(days / 30);
    if (months < 12) {
        return '< 1 an';
    }

    const years = Math.floor(days / 365);
    return `< ${years + 1} ans`;
}
