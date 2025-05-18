import { AnyObject } from '@/store/interface';

import rootReducer from './rootReducer';

export type RootState = ReturnType<typeof rootReducer>;

declare module 'react-redux' {
  export type EqualityFnType<TSelected> = (
    left: TSelected,
    right: TSelected
  ) => boolean;

  // export function useSelector<TSelected>(
  //   selector: (state: RootState) => TSelected,
  //   equalityFn?: EqualityFnType<TSelected>
  // ): TSelected;
}

export type UploadImage = {
  name: string;
  src: string;
  file: File;
};

export type Param = {
  key: string;
  value: number | string;
};

export type RawWithdrawalRequest = {
  id: string;
  owner: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  status: string;
  createdAt: string;
};

export type RawForm = {
  id: string ;
  name: string;
  loaddata: any[];
  createdAt: string;
  idviewform: string;
  owner: string;
  pageHistory: string;
  slug: string,
  updatedAt: string,
  urlMain: string,
  version: string,
  sections: any,
};

export type RawUser = {
  id: number;
  username: string;
  email: string;
  credit: number;
  is_super_admin: number;
  createdAt: string;
  isAffiliate: boolean;
  idcredit: string;
  referCredit: number;
  referId: number;
  referCreditDone: number;
  referCreditWait: number;
};


export type RawSystemAnnoucement = {
  id: number;
  image: string;
  content: string;
  type: string;
  createdAt: string;
  status: string;
  link: string;
  owner: string
};


export type RawImage = {
  id: number;
  link: string;
  name: string;
};


export type RawLoginSession = {
  ip: string;
  id: number;
  start_time: number;
};



export type RawOrder = {
  idview: string;
  id: string;
  name: string;
  num: number;
  type: string;
  delay: number;
  createdAt: string;
  status: string;
  url: string;
  pageHistory: string;
  owner: string;
  version: string;
  passed_num: number;
  failed_num: number;
  data: any[];
};


export type RawCredit = {
  id: string;
  direction: string;
  owner: string;
  status: string;
  description: string;
}


export type RawDownloadLink = {
  name: string;
  link: string;
};


export type RawPagination = {
  page: number;
  page_size: number;
  total: number;
};


