// Retry wrapper for unreliable operations (KV, API calls)
export async function withRetry<T>(
    fn: () => Promise<T>,
    options: {
        retries?: number;
        delay?: number;
        onRetry?: (attempt: number, error: any) => void;
    } = {}
): Promise<T> {
    const { retries = 3, delay = 1000, onRetry } = options;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt === retries) {
                throw error;
            }

            if (onRetry) {
                onRetry(attempt, error);
            }

            await new Promise((resolve) => setTimeout(resolve, delay * attempt));
        }
    }

    throw new Error("Retry failed");
}
