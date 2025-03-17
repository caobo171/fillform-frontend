var COLORS =["#2a91d6", "#00BCD4", "#26A69A", "#4CAF50", "#5969c5", "#FFC107", "#FF6F22", "#CF5555", "#ee59ba"];

class UI {
    str2int(str: string) {

        if (!str){
            return 1;
        }

        var r = 3;
        for (var i = 0; i < str.length; i++) {
            r += str.charCodeAt(i) * str.charCodeAt(i);
        }

        return r % 8 + 1;
 
    }

    getColorByString(text: string) {
        return COLORS[this.str2int(text)];
    };
};


export default new UI();