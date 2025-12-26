/**
 * Utility function to trim whitespace from all string values in an object
 * Useful for form data sanitization
 */
export const trimValues = <T extends Record<string, unknown>>(obj: T): T => {
    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [
            key,
            typeof value === 'string' ? value.trim() : value,
        ])
    ) as T;
};

