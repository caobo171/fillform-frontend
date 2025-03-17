import { pickSubArray } from '@/utils/random/RandomUtils';

const wordRegex = /[a-zA-Z0-9']+|\(|\)|\/|%|\.|,|;|!|\?|:|-|@|"|\$|£|€|\n/g;

const punctuationHasLeftSPaceNeedToBeRemoved = [
  '.',
  ',',
  '!',
  '?',
  ';',
  ':',
  '-',
  '@',
  ')',
  '%',
  '/',
];

const punctuationHasRightSPaceNeedToBeRemoved = ['@', '-', '/', '('];

const moneySymbols = ['$', '£', '€'];

// punctuation '-' must be in the end of the array because of the regex
const specialPunctuations = [
  '$',
  '£',
  '€',
  '%',
  '.',
  ',',
  '!',
  '?',
  ';',
  ':',
  '@',
  '"',
  '(',
  ')',
  '/',
  '-',
];

const zCode = 122;
const aCode = 97;
const zeroCode = 48;
const nineCode = 57;

const hasSpecialPunctuation = (word: string) =>
  specialPunctuations.some((value) => word.includes(value));

const shouldAddNoSpaceNext = (currentWord: string, nextWord: string) =>
  punctuationHasLeftSPaceNeedToBeRemoved.includes(nextWord) ||
  punctuationHasRightSPaceNeedToBeRemoved.includes(currentWord) ||
  (currentWord === '.' &&
    !!nextWord &&
    nextWord.charCodeAt(0) >= aCode &&
    nextWord.charCodeAt(0) <= zCode) ||
  (currentWord !== ':' && nextWord === '"') ||
  (moneySymbols.includes(nextWord) &&
    currentWord.charCodeAt(0) >= zeroCode &&
    currentWord.charCodeAt(0) <= nineCode);

const shouldAddNoSpacePrevious = (prevWord: string, currentWord: string) =>
  currentWord === '"' && prevWord === ':';

/**
 * @desc Check if the word of paragraph is Acronym or not
 * @desc example: A.V.
 * @param currentWord
 * @param secondWordFromCurrent
 * @returns boolean
 */
const shouldAddNoSpaceWithAcronym = (
  currentWord: string,
  secondWordFromCurrent: string
) =>
  currentWord === '.' &&
  !!secondWordFromCurrent &&
  secondWordFromCurrent === '.';
/**
 * @desc Only replace alphabet with underline, @ ' or other special characters will be ignored
 * @param value
 * @returns
 */
const replaceWordWithUnderline = (value: string) => {
  let result = '';
  for (let i = 0; i < value.length; i++) {
    if (
      (i > 0 && i < value.length - 1 && value[i] === "'") ||
      value[i].match(/[a-zA-Z0-9]/g)
    ) {
      result += '_';
    } else {
      result += value[i];
    }
  }
  return result;
};

/**
 * @desc Because having some quote not in the wordRegex, we need to replace them
 * @param paragraph
 * @returns string
 */
const replaceQuote = (paragraph?: string) =>
  paragraph?.replace(/[‘’]/g, "'").replace(/[“”]/g, '"') || '';

/**
 * @desc Replace all special dash to normal dash
 * @param paragraph
 * @returns string
 */
const replaceDash = (paragraph?: string) =>
  paragraph?.replace(/–/g, '-')?.replace(/—/g, '-') || '';

/**
 * @desc Replace all special ellipsis to normal ellipsis
 * @param paragraph
 * @returns string
 */
const replaceEllipsis = (paragraph?: string) =>
  paragraph?.replace(/…/g, '...') || '';

const formatParagraph = (paragraph?: string) => {
  // Format step 1 replace all special quote
  paragraph = replaceQuote(paragraph);

  // Format step 2 replace all special dash
  paragraph = replaceDash(paragraph);

  // Format step 3 replace all special ellipsis
  paragraph = replaceEllipsis(paragraph);

  return paragraph;
};

const getHintIndexesWithoutHint = (object_paragraph: any) => {
  const specialPunctuations = [
    '.',
    ',',
    '!',
    '?',
    ';',
    ':',
    '-',
    '@',
    '"',
    ')',
  ];
  const newHintIndexes = Object.keys(object_paragraph).map((value) =>
    Number(value)
  );

  Object.keys(object_paragraph).forEach((key) => {
    const numberKey = Number(key);
    if (
      numberKey === 0 ||
      object_paragraph[numberKey] === '\n' ||
      specialPunctuations.includes(object_paragraph[numberKey]) ||
      ['\n', '.', '"'].includes(object_paragraph[numberKey - 1])
    ) {
      const removeIndex = newHintIndexes.indexOf(numberKey);
      if (removeIndex > -1) {
        newHintIndexes.splice(removeIndex, 1);
      }
    }
  });

  return newHintIndexes;
};

/**
 * @desc Don't know why ?
 * @desc Parse from array [a,b,c,d] to object {0:a, 1:b, 2:c, 3:d}
 * @param paragraph
 * @returns
 */
const splitWords = (paragraph: string) => {
  const array = (
    paragraph.replace(/(\r\n|\r)/gm, '\n').match(wordRegex) ?? []
  ).filter((value: string) => value !== ' ');
  return { ...array };
};

const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const generateHintIndexes = (paragraph: string, hint_ratio: number = 0.3) => {
  const wordsObj = splitWords(paragraph);
  for (const key in wordsObj) {
    if (wordsObj[key] === '\n' || specialPunctuations.includes(wordsObj[key])) {
      delete wordsObj[key];
    }
  }
  const wordIndexes = Object.keys(wordsObj);

  const shuffleWordIndexes = shuffleArray(wordIndexes);
  return shuffleWordIndexes
    .slice(0, Math.floor(wordIndexes.length * hint_ratio))
    .map((value: string) => parseInt(value));
};

/**
 * @desc Show the paragraph with blank positions match with hint indexes
 * @param paragraph
 * @param hintIndexes
 * @returns
 */
const getParagraphWithHintIndexes = (
  paragraph: string,
  hintIndexes: number[]
) => {
  const paragraphObject = splitWords(paragraph.replace(/(\r\n|\r)/gm, '\n'));

  let resultString = '';
  for (let i = 0; i < Object.keys(paragraphObject).length; i++) {
    const removeEnterValue = paragraphObject[i].replace('\n', '');
    const convertedValue = hintIndexes.includes(i)
      ? replaceWordWithUnderline(removeEnterValue)
      : removeEnterValue;

    if (paragraphObject[i].includes('\n')) {
      resultString += '\n';
      continue;
    }

    if (
      shouldAddNoSpaceNext(paragraphObject[i], paragraphObject[i + 1]) ||
      (!!paragraphObject[i - 1] &&
        shouldAddNoSpacePrevious(paragraphObject[i - 1], paragraphObject[i])) ||
      shouldAddNoSpaceWithAcronym(paragraphObject[i], paragraphObject[i + 2])
    ) {
      resultString += convertedValue;
    } else {
      resultString += `${convertedValue} `;
    }
  }

  return resultString;
};

const getInvalidCharactersFromParagraph = (paragraph: string) => {
  const pattern = new RegExp(`[${specialPunctuations.join('')}]`, 'g');
  return paragraph.replace(/[\r\n\s0-9a-zA-Z']/g, '').replace(pattern, '');
};

const getErrorWords = (paragraph: string) => {
  const words = paragraph
    .replace(/(\r\n|\r|\n)/gm, ' ')
    .split(' ')
    .filter((e) => e !== '');
  const errorWords = [];
  for (const key in words) {
    if (getInvalidCharactersFromParagraph(words[key]).length > 0) {
      errorWords.push(words[key]);
    }
  }
  return errorWords;
};

// sinh ra 1 mang int la vi tri cac hint
export const legacyGenerateHint = (text: string, hintRatio: number = 0.3) => {
  // convert ve cung mot kieu dau cach
  text = text.replace(/\s+/g, ' ');

  const wordCount = text.split(' ').length;

  // lay 1 luong tu ngau nhien bang HINT_RATIO * tong so tu lam hint
  const wordIndexes = Array.from({ length: wordCount }, (_, i) => i);
  const hintCount = Math.floor(wordCount * hintRatio);

  let hintIndexes = pickSubArray(wordIndexes, hintCount);

  // sort vi tri cua cac hint
  if (hintIndexes != null) {
    hintIndexes = hintIndexes.sort((a, b) => a - b);
  }

  return hintIndexes;
};

export const legacySplitWords = (text: string) => {
  const values = text.replace(/(\r\n|\r)/gm, '\n').split(/[,. ;!?]+/);

  for (let i = 0; i < values.length; i++) {
    // if there are multiple new lines character between two words, split it
    // if input "a\nb" or "a\n\n\nb" => return true
    if (values[i].indexOf('\n') > 0) {
      // beforeNewLine = "a"

      const wordBeforeNewLine = values[i].split('\n')[0];
      // rest = "\nb" or "\n\n\nb"
      const rest = values[i].substring(wordBeforeNewLine.length);

      values[i] = wordBeforeNewLine;
      // insert rest after wordBeforeNewLine
      values.splice(i + 1, 0, rest);
    }
  }
  return values;
};

export const getParagraphTextWithHint = (
  paragraph: string,
  hintIndexes: number[]
) => {
  const values = legacySplitWords(paragraph);

  const convertedValues = values.map((value, index) => {
    if (hintIndexes.indexOf(index) > -1) {
      return value.replace(/\w/g, '_');
    }

    return value;
  });

  return convertedValues.join(' ');
};

export const HintHelpers = {
  splitWords,
  replaceWordWithUnderline,
  shouldAddNoSpaceNext,
  shouldAddNoSpacePrevious,
  generateHintIndexes,
  specialPunctuations,
  getParagraphWithHintIndexes,
  getHintIndexesWithoutHint,
  getErrorWords,
  formatParagraph,
  hasSpecialPunctuation,
  getInvalidCharactersFromParagraph,
  shouldAddNoSpaceWithAcronym,
};

export default HintHelpers;
