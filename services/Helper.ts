import dayjs from 'dayjs';
import { sortBy, uniqBy } from 'lodash';
import moment from 'moment';

import { RankRecord } from '@/store/interface';
import {
  RawUser,
  UploadImage,
} from '@/store/types';
import { QUESTION_TYPE } from '@/core/Constants';

// import { AppRouterContext } from "";

type Param = {
  key: string;
  value: number | string;
};
export class Helper {
  static time() {
    return Math.floor(new Date().getTime() / 1000);
  }

  static isMobileDevice() {
    return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  static normalizeUrl(uri: string) {
    return uri.normalize('NFD').replace(/\s/g, '+');
  }

  static isWord(str: string) {
    return /^[a-zA-Z0-9\'\"]+$/.test(str);
  }

  static waitUntil = function (callback: () => boolean) {
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (callback()) {
          clearInterval(interval);
          resolve(true);
        }
      }, 100);
    });
  }

  static purify = function (txt: string) {
    let temp = `${txt}`;

    if (!temp || !temp.length) {
      return '';
    }

    // Remove HTML tags
    temp = temp.replace(/<\/[^>]*>/gm, '');
    temp = temp.replace(/<[^>]*>/gm, '');
    temp = temp.replace(/<>/gm, '');
    
    // Remove all whitespace characters (spaces, tabs, newlines, etc.)
    temp = temp.replace(/\s+/gm, '');
    
    // Convert to lowercase
    temp = temp.toLowerCase();

    return temp;
  };

  static convertMoney(val: number | string) {
    const numberString = String(val).replace(/^\d+/, (number) =>
      [...number]
        .map(
          (digit, index, digits) =>
            (!index || (digits.length - index) % 3 ? '' : ',') + digit
        )
        .join('')
    );

    return numberString;
  }

  static getQueryString(search_params: any) {
    const object = Object.fromEntries(search_params.entries());
    return Object.keys(object)
      .map((key) => `${key}=${object[key]}`)
      .join('&');
  }

  static getUrlQuery(object: any) {
    const array = Object.keys(object).map((e) => ({
      key: e,
      value: object[e],
    }));

    return `?${Helper.setAndGetURLParam(array)}`;
  }

  static setAndGetURLParam(params: Param[], is_array = '') {
    if (typeof window !== 'undefined') {
      const queries = new URLSearchParams(window.location.search);
      for (let i = 0; i < params.length; i++) {
        if (params[i].value) {
          queries.set(params[i].key, `${params[i].value}`);
        } else {
          queries.delete(params[i].key);
        }
      }
      return queries.toString();
    }

    return '';
  }

  static getURLParams() {
    if (typeof window !== 'undefined') {
      const queries = new URLSearchParams(window.location.search);
      const result: any = {};
      const entries = [...queries.entries()];
      for (let i = 0; i < entries.length; i++) {
        result[entries[i][0]] = entries[i][1];
      }
      return result;
    }
    return {};
  }

  static getURLParam(key: string) {
    if (typeof window !== 'undefined') {
      const queries = new URLSearchParams(window.location.search);
      return queries.get(key);
    }
    return '';
  }

  static getTime(value: number) {
    const days = Math.floor(value / 86400);
    const hours = Math.floor((value % 86400) / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = Math.floor(value % 60);
    return days || hours
      ? `${days} days ${hours} hours ${minutes} minutes`
      : `${hours} hours ${minutes} minutes ${seconds} seconds`;
  }

  static generateCode(value: string) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-zA-Z0-9_-]/g, '_') // Replace any non-alphanumeric chars (except _ and -) with underscore
      .toLowerCase()
      .substring(0, 100); // Use substring instead of substr (which is deprecated)
  }

  static validLink(value: string) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s/g, '_')
      .toLowerCase();
  }

  static getDay = function (value: number) {
    const date = new Date(value * 1000);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  static getDayWithoutYear = function (value: number) {
    const date = new Date(value * 1000);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  static getUnixNum = function (date?: any) {
    if (!date) {
      date = new Date();
    }
    return Math.round(new Date(date).getTime() / 1000);
  };

  static getHourMinute(value: number) {
    const date = new Date(value * 1000);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  static getTimeListen(value: number, short: boolean = false) {
    const hours = Math.floor(value / 3600)
      .toString()
      .padStart(2, '0');
    const minutes = Math.floor((value % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const seconds = value - parseInt(hours) * 3600 - parseInt(minutes) * 60;

    if (short) {
      return `${hours}:${minutes}:${seconds}s `;
    }

    return `${hours} hours ${minutes} minutes `;
  }

  static getDateInputFormat = function (value?: number) {
    const date = value ? new Date(value * 1000) : new Date();
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  };

  static getExactDay = function (value: number) {
    const date = new Date(value * 1000);
    if (date.getHours() == 0 && date.getMinutes() == 0) {
      return ` ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    }
    return ` ${date.getHours() > 9 ? date.getHours() : `0${date.getHours().toString()}`}:${date.getMinutes() > 9 ? date.getMinutes() : `0${date.getMinutes().toString()}`} ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  static uniqueArray<M>(array: M[], key: string) {
    const result_obj: any = {};
    for (let i = 0; i < array.length; i++) {
      // @ts-ignore
      result_obj[array[i][key]] = array[i];
    }

    return Object.values(result_obj).sort(
      (a: any, b: any) => a[key] - b[key]
    ) as M[];
  }

  static convertTime = function (dateInput: Date) {
    const date = new Date(dateInput);
    return ` ${date.getHours()}:${date.getMinutes()} ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  static getInnerHeight = function () {
    return window.innerHeight;
  };

  static fullTextSearch = function (
    arrays: any[],
    key: string,
    search_text: string,
    bonus_keys: string[] = []
  ) {
    if (key) {
      return arrays.filter((e) => {
        const r_search_text = search_text
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase();
        const text = e[key]
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase();

        if (text.indexOf(r_search_text) >= 0) {
          return true;
        }
        if (bonus_keys.length > 0) {
          for (let i = 0; i < bonus_keys.length; i++) {
            const bonus_text = e[bonus_keys[i]]
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .toLowerCase();

            if (bonus_text.indexOf(r_search_text) >= 0) {
              return true;
            }
          }
        }
        return false;
      });
    }

    return arrays.filter((e) => {
      const r_search_text = search_text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
      const text = e
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

      return text.indexOf(r_search_text) >= 0;
    });
  };

  static shortenText(input: string, length: number) {
    if (input.length > length - 3) {
      return `${input.slice(0, length)}...`;
    }

    return input;
  }


  static isSelectType(type: number) {
    return type == QUESTION_TYPE.MULTIPLE_CHOICE
      || type == QUESTION_TYPE.CHECKBOX
      || type == QUESTION_TYPE.MULTIPLE_CHOICE_GRID
      || type == QUESTION_TYPE.CHECKBOX_GRID
      || type == QUESTION_TYPE.RATING
      || type == QUESTION_TYPE.DROPDOWN
      || type == QUESTION_TYPE.LINEAR_SCALE
  }


  static isNoneFormType(type: number) {
    return type == QUESTION_TYPE.IMAGE_BLOCK
      || type == QUESTION_TYPE.VIDEO_BLOCK
      || type == QUESTION_TYPE.SECTION_BLOCK
      || type == QUESTION_TYPE.TITLE_BLOCK
  }


  static isTypingType(type: number) {
    return type == QUESTION_TYPE.SHORT_ANSWER
      || type == QUESTION_TYPE.PARAGRAPH
      || type == QUESTION_TYPE.DATE
      || type == QUESTION_TYPE.TIME
  }



  static readDataUrl = function (file: File): Promise<UploadImage> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const ref_file = file;
      reader.readAsDataURL(file);
      reader.onloadend = (e) => {
        resolve({
          src: reader.result as string,
          name: ref_file.name,
          file: ref_file,
        });
      };
    });
  };

  static extractContentByRegex(s: string) {
    if (!s) {
      return s;
    }

    s = s.replace(/\<(.+?)\>/g, ' ');
    if (s.length > 80) s = `${s.substring(0, 80)}...`;
    return s;
  }

  static extractContent(s: string) {
    s = s.replace(/\<(.+?)\>/g, ' ');
    return s;
  }

  static get21dayslabels() {
    const current_time = Math.floor(new Date().getTime() / 1000);

    const labels: string[] = [];

    for (let index = 21; index > 0; index--) {
      labels.push(this.getDayWithoutYear(current_time - index * 60 * 60 * 24));
    }

    return labels;
  }


  static mapUserById = (users: RawUser[]) => {
    const mapping = {} as { [key: number]: RawUser };
    for (const user of users) {
      mapping[user.id] = user;
    }
    return mapping;
  };


  static getRankStatus = (rank: number, rank_record: RankRecord) => {
    if (!rank_record.rank && rank == 1) {
      return 0;
    }
    if (Helper.time() - rank_record.last_update > 60 * 60 * 6) {
      return rank_record.rank - rank;
    }
    return rank == rank_record.rank
      ? rank_record.status
      : rank_record.rank - rank;
  };

  static convertFromNowToVNText(value?: string) {
    if (typeof value !== 'string') {
      return value;
    }

    return value
      .replace('ago', 'trước')
      .replace('years', 'năm')
      .replace('months', 'tháng')
      .replace('days', 'ngày')
      .replace('hours', 'giờ')
      .replace('minutes', 'phút')
      .replace('seconds', 'giây')
      .replace('a year', '1 năm')
      .replace('a month', '1 tháng')
      .replace('a day', '1 ngày')
      .replace('an hour', '1 giờ')
      .replace('a minute', '1 phút')
      .replace('a few', 'vài');
  }

  static pad(num: number) {
    return num.toString().padStart(2, '0');
  }

  static hhmmss(secs: number) {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;

    return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  static formatNumber(value?: unknown, decimal: number = 2) {
    let val: number = Number(value);

    if (Number.isNaN(val)) {
      return 0;
    }

    // == start rounding number
    // with decimal number, we need to support rounded, for example:
    // 1.2368, decimal=2 --> return 1.24

    const round = Number(`1${new Array(decimal).fill(0).join('')}`);

    val = Number((Math.round(val * round) / round).toFixed(decimal));

    // == end rounding number

    const formatter = new Intl.NumberFormat('vi-VN');

    return formatter.format(val);
  }

  // Remove accents/diacritics in a string
  static removeAccents(str?: string) {
    if (typeof str !== 'string') {
      return str;
    }

    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  }

  // The date format for value and defaultValue should be
  // [YYYY-MM-DD][T][hh:mm] (type=datetime-local) / [YYYY-MM-DD] (type=date)
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input/date#value
  static dateToInputDate(date?: number, length?: number) {
    if (!date || !dayjs(date).isValid()) {
      return undefined;
    }

    return new Date(date * 1000).toISOString().substring(0, length ?? 16);
  }

  static isPremiumUser(sub: any) {

    return (
      sub?.plan === 'premium' && sub?.end_date > (new Date().getTime() / 1000)
    );
  }

  static getCoinString(coin: number) {
    return `${coin} ${coin === 1 ? 'coin' : 'coins'}`;
  }



  static convertToCSV(objArray: any) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';

    for (var i = 0; i < array.length; i++) {
      var line = '';
      for (var index in array[i]) {
        if (line != '') line += ','

        line += `"${array[i][index]}"`;
      }

      str += line + '\r\n';
    }

    return str;
  }

  static exportCSVFile(headers: any, items: any, fileTitle: any) {
    if (headers) {
      items.unshift(headers);
    }

    // Convert Object to JSON
    var jsonObject = JSON.stringify(items);

    var csv = this.convertToCSV(jsonObject);

    var exportedFilenmae = fileTitle + '.csv' || 'export.csv';

    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    // @ts-ignore
    if (navigator.msSaveBlob) { // IE 10+
      // @ts-ignore
      navigator.msSaveBlob(blob, exportedFilenmae);
    } else {
      var link = document.createElement("a");
      if (link.download !== undefined) { // feature detection
        // Browsers that support HTML5 download attribute
        var url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", exportedFilenmae);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }


}
