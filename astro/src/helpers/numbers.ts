export const randomFloat = (min: number, max: number): number => {
    return Math.random() * (max - min) + min;
};

export const randomInt = (min: number, max: number): number => {
    return Math.floor(randomFloat(min, max));
};
