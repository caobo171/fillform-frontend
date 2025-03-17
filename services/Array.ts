class ArrayHelper {
    unique<M>(values: M[], compareFunc?: (a: M, b: M) => boolean) {
        var results = [];
        for (let i = 0; i < values.length; i++) {
            var is_exist = results.find((el) => {
                if (compareFunc) {
                    return compareFunc(el, values[i]);
                } else {
                    return el == values[i];
                }
            });

            if (!is_exist) {
                results.push(values[i]);
            }
        }

        return results as M[];
    }
};


export default new ArrayHelper();