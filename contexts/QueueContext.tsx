'use client';

import { cloneDeep, pullAllBy, unionBy } from 'lodash';
import { createContext, useMemo, useReducer } from 'react';

import { RawPodcast } from '@/store/types';

export enum QueueAction {
  UpdatePlaying,
  UpdatePodcasts,
  PlayPrevious,
  PlayNext,
  ShowList,
  AddPodcasts,
  RemovePodcasts,
}

type QueueActionObject =
  | {
      type: QueueAction.UpdatePlaying;
      playing: RawPodcast;
    }
  | {
      type: QueueAction.PlayPrevious;
    }
  | {
      type: QueueAction.PlayNext;
    }
  | {
      type: QueueAction.UpdatePodcasts;
      podcasts: RawPodcast[];
    }
  | {
      type: QueueAction.ShowList;
      showList: boolean;
    }
  | {
      type: QueueAction.AddPodcasts;
      podcasts: RawPodcast[];
    }
  | {
      type: QueueAction.RemovePodcasts;
      podcasts: RawPodcast[];
    };

type QueueValueObject = {
  playing?: RawPodcast;
  podcasts: RawPodcast[];
  showList?: boolean;
};

const queueDefaultValue = {
  playing: undefined,
  podcasts: [],
  showList: false,
};

type QueueContextObject = {
  queue: QueueValueObject;
  setQueue: React.Dispatch<QueueActionObject>;
};

export const QueueContext = createContext<QueueContextObject>({
  queue: queueDefaultValue,
  setQueue: (): void => {},
});

type QueueProviderProps = {
  children: React.ReactNode;
};

const queueReducer = (
  state: QueueValueObject,
  action: QueueActionObject
): QueueValueObject => {
  switch (action.type) {
    case QueueAction.UpdatePlaying: {
      return { ...state, playing: action.playing };
    }
    case QueueAction.PlayPrevious: {
      const index = state.podcasts.findIndex(
        (item) => item.id === state.playing?.id
      );

      if (state.podcasts[index - 1]) {
        return { ...state, playing: state.podcasts[index - 1] };
      }

      return state;
    }
    case QueueAction.PlayNext: {
      const index = state.podcasts.findIndex(
        (item) => item.id === state.playing?.id
      );

      if (state.podcasts[index + 1]) {
        return { ...state, playing: state.podcasts[index + 1] };
      }

      return state;
    }
    case QueueAction.ShowList: {
      return { ...state, showList: action.showList };
    }
    case QueueAction.UpdatePodcasts: {
      return { ...state, podcasts: action.podcasts };
    }
    case QueueAction.RemovePodcasts: {
      const currentList = cloneDeep(state.podcasts);

      const newList = pullAllBy(currentList, action.podcasts, 'id');

      return { ...state, podcasts: newList };
    }
    case QueueAction.AddPodcasts: {
      const currentList = cloneDeep(state.podcasts);

      //  get the new array of combined values base on id
      const newList = unionBy(currentList, action.podcasts, 'id');

      return { ...state, podcasts: newList };
    }
    default: {
      return state;
    }
  }
};

export function QueueProvider({ children }: QueueProviderProps) {
  const [queue, setQueue] = useReducer(queueReducer, queueDefaultValue);

  // prevent unnecessary re-render
  const contextValue = useMemo(
    () => ({
      queue,
      setQueue,
    }),
    [queue, setQueue]
  );

  return (
    <QueueContext.Provider value={contextValue}>
      {children}
    </QueueContext.Provider>
  );
}
