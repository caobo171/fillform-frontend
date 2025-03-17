import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Select } from '@/components/common';
import { AddCustomRatioModal } from '@/components/podcast.hint/AddCustomRatioModal';
import { Button } from '@/components/ui/Button';
import hintHelpers, { legacyGenerateHint } from '@/helpers/hint';
import { Toast } from '@/services/Toast';

import CustomHintModal from './CustomHintModal';

interface GenerateHintButtonsProps {
  onChangeHintIndexes: (value: number[]) => void;
  paragraph?: string;
  version?: number;
}

const defaultRatioList = [0.25, 0.5, 0.75];

const GenerateHintButtons: React.FC<GenerateHintButtonsProps> = ({
  paragraph = '',
  onChangeHintIndexes,
  version = 1,
}) => {
  const [isOpenCustomModal, setIsOpenCustomModal] = useState<boolean>(false);
  const [isOpenAddCustomRatioModal, setIsOpenAddCustomRatioModal] =
    useState<boolean>(false);
  const [ratioList, setRatioList] = useState<number[]>([]);
  const [selectedRatio, setSelectedRatio] = useState<number | undefined>(
    undefined
  );

  useEffect(() => {
    setRatioList(
      JSON.parse(
        localStorage?.getItem('customRatio') || JSON.stringify(defaultRatioList)
      )
    );
  }, []);

  const ratioOptions = useMemo(
    () =>
      ratioList.map((ratio) => ({
        value: ratio,
        label: `${ratio * 100}%`,
      })),
    [ratioList]
  );

  const changeRatio = useCallback(
    (ratio: number) => {
      if (!onChangeHintIndexes) {
        return;
      }

      const hintIndexes =
        version >= 2
          ? hintHelpers.generateHintIndexes(paragraph, ratio)
          : legacyGenerateHint(paragraph, ratio);
      onChangeHintIndexes(hintIndexes);
    },
    [onChangeHintIndexes, paragraph, version]
  );

  const handleClickGenerate = useCallback(() => {
    if (!selectedRatio) {
      Toast.error('Please select a ratio');
      return;
    }

    changeRatio(selectedRatio);
  }, [changeRatio, selectedRatio]);

  const handleAddCustomRatio = useCallback(
    (ratio: number) => {
      if (ratio < 0 || ratio > 100) {
        Toast.error('Please enter a valid ratio between 0 and 100');
        return;
      }

      const value = ratio / 100;

      if (ratioList.includes(value)) {
        Toast.error('This ratio already exists');
        return;
      }

      localStorage.setItem(
        'customRatio',
        JSON.stringify([...ratioList, value])
      );
      setRatioList([...ratioList, value]);
      setSelectedRatio(value);
      setIsOpenAddCustomRatioModal(false);
    },
    [ratioList]
  );

  return (
    <>
      <div className="flex gap-x-2 items-center flex-wrap gap-y-6">
        <div className="relative">
          <Select
            options={ratioOptions}
            placeholder="Select ratio"
            onChange={(value) => {
              if (typeof value !== 'number') {
                return;
              }

              setSelectedRatio(value);
            }}
            value={selectedRatio}
            className="w-52"
          />
          <span
            className="absolute right-1.5 mt-0.25 underline text-gray-500 hover:text-primary hover:cursor-pointer"
            onClick={() => setIsOpenAddCustomRatioModal(true)}
          >
            Add a custom ratio
          </span>
        </div>
        <Button
          size="small"
          type="outline"
          onClick={handleClickGenerate}
          htmlType="button"
        >
          Generate
        </Button>
        <Button
          size="small"
          onClick={() => setIsOpenCustomModal(true)}
          htmlType="button"
        >
          Custom
        </Button>
      </div>
      {isOpenCustomModal && (
        <CustomHintModal
          isOpen={isOpenCustomModal}
          setIsOpen={setIsOpenCustomModal}
          paragraph={paragraph}
          onChangeHintIndexes={onChangeHintIndexes}
          version={version}
        />
      )}
      {isOpenAddCustomRatioModal && (
        <AddCustomRatioModal
          setIsOpen={setIsOpenAddCustomRatioModal}
          isOpen={isOpenAddCustomRatioModal}
          onAddCustomRatio={handleAddCustomRatio}
        />
      )}
    </>
  );
};

export default GenerateHintButtons;
