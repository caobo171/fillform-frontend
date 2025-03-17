import React, { useCallback, useState } from 'react';

import { Button, Modal, TextArea } from '@/components/common';
import HintHelpers from '@/helpers/hint';

import HintInteractiveSelection from './HintInteractiveSelection';

interface CustomHintModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  paragraph: string;
  onChangeHintIndexes: (indexes: number[]) => void;
  version?: number;
}

const { splitWords } = HintHelpers;

const CustomHintModal: React.FC<CustomHintModalProps> = ({
  isOpen,
  setIsOpen,
  paragraph,
  onChangeHintIndexes,
  version = 1,
}) => {
  const [tempHintIndexes, setTempHintIndexes] = useState<number[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');

  const handleDone = useCallback(() => {
    onChangeHintIndexes(tempHintIndexes);
    setIsOpen(false);
  }, [tempHintIndexes, onChangeHintIndexes, setIsOpen]);

  const handleOnImportOk = useCallback(() => {
    const paragraphWordsObject = splitWords(paragraph);
    const convertedObject: {
      [key: string]: number[];
    } = {};
    for (const property in paragraphWordsObject) {
      let value = paragraphWordsObject[property].toLowerCase();
      if ([`'`, '"'].includes(value[0]))
        value = value.substring(1, value.length);
      if ([`'`, '"'].includes(value[value.length - 1]))
        value = value.substring(0, value.length - 1);

      if (convertedObject[value] === undefined) {
        convertedObject[value] = [];
      }

      convertedObject[value].push(parseInt(property, 10));
    }

    const importTextArray = importText
      .replaceAll(' ', '')
      .split(',')
      .map((item) => item.trim().toLowerCase());
    const newHintIndexes = importTextArray.reduce(
      (acc: number[], item: string) => {
        if (convertedObject[item]) {
          return [...acc, ...convertedObject[item]];
        }
        return acc;
      },
      tempHintIndexes
    );

    setTempHintIndexes(
      // Remove duplicate indexes
      newHintIndexes.filter(
        (item, index) => newHintIndexes.indexOf(item) === index
      )
    );
    setIsImportModalOpen(false);
  }, [importText, paragraph, tempHintIndexes]);

  return isOpen ? (
    <Modal
      title={
        <>
          <Button
            size="small"
            onClick={() => setTempHintIndexes([])}
            type="text"
            className="mr-4"
          >
            Reset
          </Button>
          <Button size="small" onClick={() => setIsImportModalOpen(true)}>
            Import words to be removed
          </Button>
        </>
      }
      open={isOpen}
      onCancel={() => setIsOpen(false)}
      onOk={() => handleDone()}
      width="800px"
    >
      <div className="max-h-screen-80 overflow-y-auto custom-scrollbar mt-4">
        <HintInteractiveSelection
          paragraph={paragraph}
          hint_indexes={tempHintIndexes}
          onChangeHintIndexes={(indexes: number[]) =>
            setTempHintIndexes(indexes)
          }
          version={version}
        />
      </div>
      <Modal
        open={isImportModalOpen}
        onCancel={() => {
          setIsImportModalOpen(false);
          setImportText('');
        }}
        onOk={() => handleOnImportOk()}
        title="List of words to be removed by blanks (separated by commas)"
        width="800px"
      >
        <div className="h-screen-30">
          <TextArea
            className="h-full"
            onChange={(event) => setImportText(event.target.value)}
          />
        </div>
      </Modal>
    </Modal>
  ) : null;
};

export default CustomHintModal;
