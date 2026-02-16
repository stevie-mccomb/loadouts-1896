export const random = <T>(a: T[]): T => {
    return a[Math.floor(Math.random() * a.length)];
};
