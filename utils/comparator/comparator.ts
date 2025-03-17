import { standardize, getStandardizedWordList, standardize_word } from "./standardize";
//@ts-ignore
import googlediff from 'googlediff';

var getDifferentBlock = (diff: any, standard_user_str: any, user_start_pos: number, standard_root_str: any, root_start_pos: number) => {
    // remove white space error: ex face book == facebook
    if (diff[1][1] == " " && diff[2][0] == 0) { // chi can them hoac bot 1 dau cach
        return null;
    }

    if (diff.length == 2) diff[2] = [0, ""];

    // get end pos
    var end_pos = user_start_pos;
    for (var i = 0; i < diff.length; i++) if (diff[i][0] != 1) end_pos += diff[i][1].length;

    // get prefix
    var incorrect_block = "";
    var correct_block = "";

    if (diff[0][0] != 1) {
        incorrect_block = getPrefix(standard_user_str.text, user_start_pos, diff[0][1], diff[0][0] != 0);
        user_start_pos = user_start_pos + diff[0][1].length - incorrect_block.length;
    }
    if (diff[0][0] != -1) {
        correct_block = getPrefix(standard_root_str.text, root_start_pos, diff[0][1], diff[0][0] != 0);
        root_start_pos = root_start_pos + diff[0][1].length - correct_block.length;
    }

    // if(diff[0][0] == 0) {
    //     var buffer_size = Math.min(user_start_pos, 10);
    //     var prefix_str = (standard_user_str.text.substr(user_start_pos - buffer_size, buffer_size) + diff[0][1]).split(" ");
    //     prefix = prefix_str[prefix_str.length - 1];
    //     user_start_pos = user_start_pos + diff[0][1].length - prefix.length;
    //     root_start_pos = root_start_pos + diff[0][1].length - prefix.length;

    //     var incorrect_block = prefix;
    //     var correct_block = prefix;
    // }
    // else if(diff[0][0] == 1){
    //     correct_block = diff[0][1];
    // }
    // else {
    //     incorrect_block = diff[0][1];
    // }

    for (var i = 1; i < diff.length - 1; i++) {
        if (diff[i][0] != 1) {
            incorrect_block += diff[i][1];
        }
        if (diff[i][0] != -1) {
            correct_block += diff[i][1];
        }
    }

    if (diff[diff.length - 1][0] != 1) {
        let end_pos = user_start_pos + incorrect_block.length + diff[diff.length - 1][1].length;
        let posfix = getPosFix(standard_user_str.text, end_pos, diff[diff.length - 1][1], diff[diff.length - 1][0] != 0);
        if (incorrect_block[incorrect_block.length - 1] != " " && posfix[0] != " ") {
            incorrect_block += posfix;
        }
    }
    if (diff[diff.length - 1][0] != -1) {
        let end_pos = root_start_pos + correct_block.length + diff[diff.length - 1][1].length;
        let posfix = getPosFix(standard_root_str.text, end_pos, diff[diff.length - 1][1], diff[diff.length - 1][0] != 0);
        if (correct_block[correct_block.length - 1] != " " && posfix[0] != " ") correct_block += posfix;
    }

    // get posfix
    // var posfix_str = (diff[diff.length - 1][1] + standard_user_str.text.substr(end_pos, 10)).split(" ");
    // var posfix = posfix_str[0];
    // incorrect_block += posfix;
    // correct_block += posfix;

    let user_block_index = getBlockIndex(user_start_pos, user_start_pos + incorrect_block.length, standard_user_str.text_map);
    let root_block_index = getBlockIndex(root_start_pos, root_start_pos + correct_block.length, standard_root_str.text_map);

    return [user_block_index.start_word, user_block_index.length, root_block_index.start_word, root_block_index.length, incorrect_block, correct_block];
}

const getPrefix = (text: string, start_pos: number, diff: string, is_diff: boolean) => {
    var buffer_size = Math.min(start_pos, 10);
    let prefix = text.substr(start_pos - buffer_size, buffer_size);
    if (!is_diff) prefix += diff;
    var prefix_str = prefix.split(" ");
    prefix = prefix_str[prefix_str.length - 1];
    if (prefix == undefined) prefix = "";
    if (is_diff) prefix += diff;
    return prefix;
}

const getPosFix = (text: string, end_pos: number, diff: string, is_diff: boolean) => {
    let posfix = text.substr(end_pos, 10);
    if (!is_diff) posfix = diff + posfix;
    var posfix_str = posfix.split(" ");
    posfix = posfix_str[0];
    if (posfix == undefined) posfix = "";
    if (is_diff) posfix = diff + posfix;
    return posfix;
}

const getBlockIndex = (start_pos: number, end_pos: number, indexes: Map<number, number>) => {
    let start_word: any = 0;
    if (indexes.get(start_pos) != null) start_word = indexes.get(start_pos);
    else {
        for (const char_id of indexes.keys()) {
            if (char_id <= start_pos) start_word = indexes.get(char_id);
            else break;
        }
    }
    let end_word: any = 0;
    if (indexes.get(end_pos) != null) end_word = indexes.get(end_pos);
    else {
        for (const char_id of indexes.keys()) {
            if (char_id <= end_pos) end_word = indexes.get(char_id);
            else break;
        }
    }

    let len = end_word - start_word + 1;
    if (start_pos == end_pos) len = 0;
    return { start_word: start_word, length: len };
}

var percisionCal = (compare_result: any, root_str: string, hint: any) => {
    var faultCount = 0;
    for (var i = 0; i < compare_result.length; i++) {
        faultCount += compare_result[i][3];
    }

    console.log("fault " + faultCount + " on " + root_str.split(" ").length);
    var output = 1 - faultCount / (root_str.split(" ").length - hint.length);

    return output;
}

var uniqueWordCount = (compare_result: any, root_str: string, hint: number[]) => {
    let fault_id = [];
    for (var i = 0; i < compare_result.length; i++) {
        for (var j = compare_result[i][2]; j < compare_result[i][2] + compare_result[i][3]; j++) fault_id.push(j);
    }

    let words = root_str.split(" ");
    let unhinted_words = [];
    let unhinted_correct_words = [];
    for (let i = 0; i < words.length; i++) {
        if (!hint.includes(i)) {
            unhinted_words.push(words[i]);
            if (!fault_id.includes(i)) unhinted_correct_words.push(standardize_word(words[i]));
        }
    }
    let unique_words = new Set<string>();
    for (let i = 0; i < unhinted_words.length; i++) {
        unique_words.add(unhinted_words[i]);
    }
    let unique_correct_words = new Set<string>();
    for (let i = 0; i < unhinted_correct_words.length; i++) {
        unique_correct_words.add(unhinted_correct_words[i]);
    }
    return {
        unique_words: [...unique_words],
        unique_correct_words: [...unique_correct_words]
    }
}

const getMistakes = (compare_result: any, root_str: string, user_str: string) => {
    let wrong_words: Map<string, Set<string>> = new Map<string, Set<string>>();
    let root_str_words = root_str.split(" ");
    let user_str_words = user_str.split(" ");
    for (let i = 0; i < compare_result.length; i++) {
        // we don't take too long mistake here
        if (compare_result[i][3] < 3 && compare_result[i][1] < 3) {
            let correct_words_list = [];
            for (let j = 0; j < compare_result[i][3]; j++) {
                correct_words_list.push(standardize_word(root_str_words[compare_result[i][2] + j]));
            }
            let correct_word = correct_words_list.join(" ");
            let wrong_words_list = [];
            for (let j = 0; j < compare_result[i][1]; j++) {
                wrong_words_list.push(standardize_word(user_str_words[compare_result[i][0] + j]));
            }
            let wrong_word = wrong_words_list.join(" ");
            if (wrong_word == "") continue;
            
            let item = wrong_words.get(correct_word);
            if (item == null) item = new Set();
            item.add(wrong_word);
            wrong_words.set(correct_word, item);
        }
    }
    return Array.from(wrong_words, ([name, value]) => ({ name, references: [...value] }));
}

const compare_no_hint = (root_str: string, user_str: string) => {
    var dmp = new googlediff();

    var standard_root = standardize(root_str);
    var standard_user_str = standardize(user_str);

    // cat bot dap an
    let extra: any = 0;
    let cutted_standard_root = standard_root;
    let compare_text_length = Math.floor(standard_user_str.text.length * 1.2);
    if (standard_root.text.length > compare_text_length) {
        // tim dau cach gan nhat
        let i: number = compare_text_length;
        while (i > 0) {
            // console.log(standard_root.text[i-1])
            if (standard_root.text[i - 1] === " ") {
                break;
            }
            i--;
        }
        extra = standard_root.text_map.get(i);
        cutted_standard_root.text = standard_root.text.substr(0, i);
    }


    var patches = dmp.patch_make(standard_user_str.text, cutted_standard_root.text);
    // console.log(patches);

    var output = [];
    var offset = 0;
    for (var i = 0; i < patches.length; i++) {
        let diff_block = getDifferentBlock(patches[i].diffs, standard_user_str, patches[i].start1 + offset, standard_root, patches[i].start1);
        if (diff_block != null) {
            output.push(diff_block);
        }
        offset += patches[i].length1 - patches[i].length2;
    }
    if (extra != 0) {
        output[output.length - 1][3] = parseInt(output[output.length - 1][3]) + standard_root.text_map.size - extra;
    }
    // console.log(output);

    return output;
}

const compare_with_hint = (root_str: string, user_str: string, hint: number[]) => {
    let root_words = root_str.replaceAll(/\s+/g, " ").split(" ");
    let user_words = user_str.replaceAll(/\s+/g, " ").split(" ");
    if (root_words.length != user_words.length) return null;

    let output = [];
    for (var i = 0; i < root_words.length; i++) {
        let standard_root = standardize_word(root_words[i]);
        let standard_user = standardize_word(user_words[i]);
        if (standard_root != standard_user) {
            if (hint.includes(i)) {
                // console.log("hint mismatch");
                return null;
            }
            output.push([i, 1, i, 1, standard_user, standard_root]);
        }
    }
    console.log(output);

    return output;
}

var compare = (root_str: string, user_str: string, hint: number[]) => {
    let output = null;


    if (hint.length != 0) output = compare_with_hint(root_str, user_str, hint);
    if (output === null) output = compare_no_hint(root_str, user_str);

    var percision = percisionCal(output, root_str, hint);

    var words = uniqueWordCount(output, root_str, hint);

    let wrong_words = getMistakes(output, root_str, user_str);
    console.log("🚀 ~ file: comparator.ts ~ line 231 ~ compare ~ wrong_words", wrong_words);

    return {
        result: [output, percision, words.unique_words.length, words.unique_correct_words.length],
        result_words: {
            wrong_words: wrong_words,
            words: words
        }
    };
}

export default compare;

export const getLengthText = (input: string) => {
    return standardize(input).text.split(" ").length;
}