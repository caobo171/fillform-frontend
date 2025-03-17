import Fetch from "@/lib/core/fetch/Fetch";

class Static{

    roles: {
        [key:string]: number;
    } = {}

    room_types: {
        label: string, value: string, id: number, image: string
    }[] = [];

    predefined_attributes: {
        label: string, id: string, code: string
    }[] = [];

    software_types: {
        label: string, id: number, value: string
    }[] = [];

    styles: {
        label: string, id: string
    }[] = [];

    async init(){
        const res: any = await Fetch.post('/api/me/init', {});
        this.roles = res.data.ROLES;
        this.room_types = res.data.ROOM_TYPES;
        this.software_types = res.data.SOFTWARE_TYPES;
        this.styles = res.data.STYLES;
        this.predefined_attributes = res.data.PREDEFINED_ATTRIBUTES;
    };

    getStyle(key:string) {
        return this.styles.find(e => e.id == key);
    }

    getSoftware(key:string) {
        return this.software_types.find(e => e.value == key);
    }
};


export default new Static();