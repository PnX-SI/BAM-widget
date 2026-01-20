/**
 * Format a date relative to today with threshold labels
 * Uses translations from i18n
 * Examples: "Aujourd'hui", "Hier", "< 1 mois", "< 1 an", "< 2 ans"
 */
export function formatRelativeDate(date: Date, translations?: any): string {
    const today = new Date();
    const diff = today.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
        return translations?.today || "Aujourd'hui";
    }

    if (days === 1) {
        return translations?.yesterday || 'Hier';
    }

    if (days < 30) {
        return translations?.lessThan1Month || '< 1 mois';
    }

    const months = Math.floor(days / 30);
    if (months < 12) {
        return translations?.lessThan1Year || '< 1 an';
    }

    const years = Math.floor(days / 365);
    const yearLabel = translations?.lessThanYears || '< {years} ans';
    return yearLabel.replace('{years}', (years + 1).toString());
}
