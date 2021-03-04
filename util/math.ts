/** Get a random value within a range of the max and min value in range */
export function rand(range: number[]) {
    return (
        Math.random() * (Math.max(...range) - Math.min(...range)) +
        Math.min(...range)
    );
}

/** Delay async execution. Returns a promise that resolves after a specified time */
export function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}