class CacheFetchManager {

    store_data: any = {};

    public cacheData(key: string, data: any) {
        this.store_data[key] = data;
    }


    public getData(key: string) {
        return this.store_data[key];
    }


    public clearData(key: string) {
        delete this.store_data[key];
    }
}