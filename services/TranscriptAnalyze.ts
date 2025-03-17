import { TranscriberData, Transcriber } from "@/hooks/transcriber/useTranscriber";
import diff_match_patch from "@/lib/google.diff";
import { Helper } from "./Helper";
import { HintHelpers } from "@/helpers/hint";
import { RawPodcast, RawPodcastSubmit } from "@/store/types";

export class TranscriptAnalyze {
    constructor(private transcript: TranscriberData['chunks']) { }

    public getTranscript(): TranscriberData['chunks'] {
        return (this.transcript || []) as TranscriberData['chunks'];
    }

    private computeDiffScore(text1: string, text2: string) {

        // const dmp = new googlediff();
        // dmp.Patch_Margin = 2;
        // dmp.Match_Threshold = 0.5;
        //@ts-ignore
        var dmp = new diff_match_patch();
        var diff = dmp.diff_main(text1, text2);
        dmp.diff_cleanupSemantic(diff);

        let totalLength = text1.length + text2.length;
        let equalLength = 0;

        diff.forEach((part: any) => {
            if (part[0] === 0) {  // equality case
                equalLength += part[1].length;
            }
        });

        return (2 * equalLength) / totalLength;
    }


    public getResultChunkWithWordIndex(podcast_submit: RawPodcastSubmit, index: number) {

        const resultArray = Object.values(podcast_submit.result_array);
        const result = this.analyze(resultArray);

        return result.find((e: any) => e.index == index);
    };


    /**
     * 
     * @param inputString 
     * @param paragraph 
     * @param startIndex 
     * @param retry < 0 mean no retry
     * @returns any
     */
    private findMostSimilarSubstring(inputString: string, paragraph: string[], startIndex: number, retry = 0): any {


        // Change it to increase the result
        let offset = 5;
        

        let inputWords = Object.values(HintHelpers.splitWords(inputString.toLowerCase())) as string[];


        if (inputWords.length <= 0){
            console.error('Cannot find pivot with empty string', inputString, paragraph, startIndex);
            return null;
        }

        let currentIndex = startIndex;
        let pivot = null;
        while (currentIndex < paragraph.length - 1) {

            let score = this.computeDiffScore(
                inputWords.filter(e => Helper.isWord(e)).join(' ').toLocaleLowerCase(), 
                paragraph.slice(currentIndex, currentIndex + inputWords.length).filter(e => Helper.isWord(e)).join(' ').toLocaleLowerCase()
            );

            if (score > 0.4) {
                pivot = {
                    start: currentIndex,
                    end: currentIndex + inputWords.length,
                    score
                };
                break;
            }
            
            currentIndex += inputWords.length;
        }

        if (!pivot){

            console.error('Cannot find pivot', inputString, paragraph, startIndex);
            return null;
        } else {
        }


        let maxScore = -1;
        let bestMatch = { start: -1, end: -1, score: 0 };
        for (let i = pivot.start - inputWords.length + 1; i < pivot.end; i++) {
            for (let j = pivot.start + 1; j < pivot.end + offset; j++) {
                let score = this.computeDiffScore(inputWords.filter(e => Helper.isWord(e)).join(' ').toLocaleLowerCase(), paragraph.slice(i, j).filter(e => Helper.isWord(e)).join(' ').toLocaleLowerCase());
                if (score > maxScore) {
                    maxScore = score;
                    bestMatch = { start: i, end: j, score };
                }

                // It satified but in the down trend of score => break it
                // if (maxScore > 0.9 && score < maxScore) {
                //     break;
                // }
            }
        }

        console.warn('bestMatch inputString', bestMatch, inputString);
        console.warn('bestMatch paragraph', bestMatch, paragraph.slice(bestMatch.start, bestMatch.end).join(' '));

        return bestMatch;
    }



    public getChunks(resultArray: string[]): {
        value: { start: number, end: number, score: number },
        timestamp: number[],
        text: string,
        result: string
    }[] {


        const chunks = [];

        if (!this.getTranscript() || !this.getTranscript().length) {
            return this.getEmptyResult(resultArray);
        }

        let startIndex = 0;
        let minIndex = resultArray.length;
        let maxIndex = 0;

        for (let i = 0; i < this.getTranscript().length; i++) {


            let chunk = {
                text: this.getTranscript()[i].text.toLowerCase().replace(/\(upbeat music\)/g, '').replace(/\[music\]/g, '').replace(/\[blank_audio\]/g, '').trim(),
                timestamp: this.getTranscript()[i].timestamp as number[]
            };

            if (!chunk.text) {
                continue;
            }

            let value = this.findMostSimilarSubstring(chunk.text, resultArray, startIndex);

            if (!value) {
                continue;
            }
            if (value.score > 0.8) {
                startIndex = value.end;

                // return analyzeResult;
                chunks.push({
                    ...chunk,
                    timestamp: chunk.timestamp as number[],
                    value,
                    result: resultArray.slice(value.start, value.end).join(' ')
                });

                if (value.start < minIndex) {
                    minIndex = value.start;
                }

                if (value.end > maxIndex) {
                    maxIndex = value.end;
                }
                console.info('TRUE')
                console.log('score', value, startIndex, resultArray.slice(value.start, value.end).join(' '));
                console.log('chunk index ' + i, chunk.text);
            } else {
                console.info('FALSE')
                console.log('score', value, startIndex, resultArray.slice(value.start, value.end).join(' '));
                console.log('chunk index ' + i, chunk.text);
            }
        }

        let cloneChunks = [];
        cloneChunks.push(chunks[0]);
        for (let i = 1; i < chunks.length; i++) {
            if (chunks[i].value.start > chunks[i - 1].value.end + 1) {
               let item = {
                    value: {
                        start: chunks[i - 1].value.end,
                        end: chunks[i].value.start,
                        score: 0
                    },
                    timestamp: [chunks[i - 1].timestamp[1], chunks[i].timestamp[0]],
                    text: '',
                    manual: 1,
                    result: resultArray.slice(chunks[i - 1].value.end, chunks[i].value.start).join(' ')
                };

                cloneChunks.push(item);
            }


            cloneChunks.push(chunks[i]);
            
        }

        if (chunks[chunks.length - 1]?.value?.end < (resultArray.length - 1)) {
            let item = {
                value: {
                    start: chunks[chunks.length - 1].value.end,
                    end: resultArray.length,
                    score: 0
                },
                timestamp: [chunks[chunks.length - 1]?.timestamp[1], chunks[chunks.length - 1]?.timestamp[1] + 1],
                text: '',
                manual: 1,
                result: resultArray.slice(chunks[chunks.length - 1]?.value?.end, resultArray.length).join(' ')
            };

            cloneChunks.push(item);
        }


        return cloneChunks;
    };


    public analyze(resultArray: string[]): {
        word: string,
        index: number,
        range: { start: number, end: number },
        timestamp: number[],
        text: string,
        result: string
    }[] {

        const analyzeResult = this.getChunks(resultArray);
        let words = [];
        for (let i = 0; i < analyzeResult.length; i++) {
            let chunk = analyzeResult[i];

            for (let word_index = chunk.value.start; word_index < chunk.value.end; word_index++) {
                if (Helper.isWord(resultArray[word_index])) {
                    words.push({
                        word: resultArray[word_index],
                        index: word_index,
                        range: chunk.value,
                        timestamp: chunk.timestamp,
                        text: chunk.text,
                        result: resultArray.slice(chunk.value.start, chunk.value.end).join(' ')
                    });
                }

            }
        }

        return words;
    }


    private getEmptyResult(resultArray: string[]): any {
        return resultArray.map((word, index) => {
            return {
                word,
                index,
                range: { start: Math.max(0, index - 5), end: Math.min(resultArray.length, index + 5) },
                timestamp: -1,
                text: '',
                result: ''
            }
        }).filter(e => Helper.isWord(e.word))


    }
}