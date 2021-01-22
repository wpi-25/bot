/** Get a random value within a range of the max and min value in range */
export function rand(range:number[]) {
    return Math.random() * (
        Math.max(...range) - Math.min(...range)
    ) + Math.min(...range);
}

/**
 * Remove `item` from `array`  
 * `array` is modified so you don't have to reassign it
 */
export function remove<T>(item:T, array:T[]) {
    let index = array.indexOf(item);
    array.splice(index, 1);
    return array;
}