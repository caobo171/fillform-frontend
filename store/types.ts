import { AnyObject } from '@/store/interface';

import rootReducer from './rootReducer';
import { z } from 'zod';
import { AdvanceModelType } from './data.service.types';

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
  id: string;
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
  data_model: any,
  owner_id: string,

  model_mode?: string,
  advance_model_config?: {
    data_model_id: string,
    mapping_question_to_variable: { [key: string]: string },
  }
  temp_data: {
    num_request: number,
    smartPLS: SmartPLSResult,
    basic_analysis: {
      descriptive_statistics: DescriptiveStatistic[],
      cronbach_alphas: CronbachAlpha[],
      efa_result: EFAResult,
      pearson_correlations: PearsonCorrelation[],
    },
    linear_regression_analysis: {
      regression_result: RegressionResult
    }
  }
};

export type RawUser = {
  id: string;
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
  role: string;
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
  data_url?: string;
  form_id?: string;
  schedule_setup?: {
    enabled: number;
    config: {
      [key: string]: string[][];
    };
  };
  config_data?: {
    spss_goal: string;
    demographic_goal: string;
    status: string;
  };
  ai_result?: {
    output_model: any;
    demographicQuestions: any[];
    analyzeData: any;
    demographicAnalysis: any;
    mapping_question_to_variable: { [key: string]: string },
    data_file: {
      name: string;
      url: string;
    };
    error?: string;
    status: string;
    report_file: {
      name: string;
      url: string;
    };
  }
  specific_delay?: {
    start_date: string;
    end_date: string;
    daily_schedules: {
      date: string;
      start_time: string;
      end_time: string;
      enabled: number;
    }[];
  }
};


export type RawCredit = {
  id: string;
  direction: string;
  owner: string;
  status: string;
  description: string;
  amount: number;
  referId?: string;
  orderType?: string;
  orderId?: string;
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


export type RawDataModel = {
  id: string;
  name: string;
  data_model: AdvanceModelType;

  owner_id: string;
  owner: string;

  version: string;
  createdAt: string;

  temp_data: {
    basic_analysis: {
      descriptive_statistics: DescriptiveStatistic[],
      cronbach_alphas: CronbachAlpha[],
      efa_result: EFAResult,
      pearson_correlations: PearsonCorrelation[],
    },
    linear_regression_analysis: {
      regression_result: RegressionResult,
    },

    smartPLS: SmartPLSResult,
    num_request: number,
  }
}


export type SmartPLSResult = {
  raw_crossloadings: {
    [latent_variable: string]: {
      [latent_variable: string]: number
    }
  },
  raw_path_coefficients: {
    [latent_variable: string]: {
      [latent_variable: string]: number
    }
  },
  raw_effects: {
    [hypothesis: string]: {
      direct: number,
      indirect: number,
      total: number,
      from: string,
      to: string
    },
  },

  raw_inner_model: {
    [hypothesis: string]: {
      estimate: number,
      from: string,
      p_t: number,
      std_error: number,
      t: number,
      to: string
    }
  },

  raw_inner_summary: {
    [variable: string]: {
      ave: number,
      block_communality: number,
      mean_redundancy: number,
      r_squared: number,
      r_squared_adj: number,
      type: string
    }
  },

  raw_outer_model: {
    [variable: string]: {
      [variable: string]: number
    }
  },

  // raw_path_coefficients: {
  //   [hypothesis: string]: {
  //     direct: number,
  //     indirect: number,
  //     total: number,
  //     from: string,
  //     to: string
  //   },
  // },


  raw_unidimensionality: {
    [variable: string]: {
      cronbach_alpha: number,
      dillon_goldstein_rho: number,
      eig_1st: number,
      eig_2nd: number,
      mode: string,
      mvs: number
    }
  },


  raw_htmt: {
    [latent_variable: string]: {
      [latent_variable: string]: number
    }
  },


  raw_fornell_larcker: {
    [latent_variable: string]: {
      [latent_variable: string]: number
    }
  },


  raw_vif: {
    inner_vif: {
      [variable: string]: {
        [variable: string]: number
      }
    },
    outer_vif: {
      [variable: string]: number
    }
  },


  raw_f_squared: {
    [variable: string]: number
  },
};

// The full Zod schema for the data model
export const DataModelSchema = z.object({
  model: z.object({
    code: z.string(),
    name: z.string(),
    model: z.enum(["second_order_SEM", "first_order_SEM", "third_order_SEM", "linear_regression"]),
    questions: z.array(z.object({
      id: z.string(),
      question: z.string(),
      answers: z.array(z.string()).optional(),
    })).describe('List questions that measure the dependent variable'),
    residual: z.number().optional().describe('Residual of the model'),
  }),
  observedItems: z.array(z.object({
    code: z.string(),
    name: z.string(),
    metatype: z.enum(["observed_variable", "dependent_variable"]),
    coefficient: z.number(),
    mean: z.number(),
    standard_deviation: z.number(),
    effect_direction: z.enum(["positive", "negative"]),
    non_effect: z.number(),
    questions: z.array(z.object({
      id: z.string(),
      question: z.string(),
      answers: z.array(z.string()).optional(),
    })).optional().describe('List questions that measure the dependent variable, it required if the model has only one level'),
    observedItems: z.array(z.object({
      code: z.string(),
      name: z.string(),
      metatype: z.enum(["observed_variable", "dependent_variable"]),
      coefficient: z.number(),
      mean: z.number(),
      standard_deviation: z.number(),
      questions: z.array(z.object({
        id: z.string(),
        question: z.string(),
        answers: z.array(z.string()).optional(),
      })).optional().describe('List questions that measure the dependent variable, it required if the model has two level'),
      observedItems: z.array(z.object({
        code: z.string(),
        name: z.string(),
        metatype: z.enum(["observed_variable", "dependent_variable"]),
        coefficient: z.number(),
        mean: z.number(),
        standard_deviation: z.number(),
        questions: z.array(z.object({
          id: z.string(),
          question: z.string(),
          answers: z.array(z.string()).optional(),
        })).describe('List of questions').optional().describe('List questions that measure the dependent variable, it required if the model has three level'),
        observedItems: z.array(z.any()).describe('List of observable variables again').optional()
      })).optional()
    })).optional()
  }))
});

export type DataModel = z.infer<typeof DataModelSchema>;



export type RawDataOrderModel = {
  id: string;
  data_model_id: string;
  name: string;
  data_model: any,
  owner_id: string;
  num: number,
  data: {
    error?: string,
    status: string,
    smartPLS?: SmartPLSResult,
    finalData: any[],

    report_file?: {
      name: string;
      url: string;
    },

    basic_analysis?: {
      cronbach_alphas: {
        construct_name: string,
        alpha: number,
        items: string[]
      }[],
      descriptive_statistics: DescriptiveStatistic[],

      correlation_matrix: {
        [variable: string]: {
          [variable: string]: number
        }
      },


      pearson_correlations: PearsonCorrelation[],

      efa_result: {
        bartlett_p_value: number,
        bartlett_test_statistic: number,

        kmo_measure: number,
        total_variance_explained: number,

        factors: {
          cumulative_variance: number,
          eigenvalue: number,
          factor_number: number,
          loadings: {
            [variable: string]: number
          },
          variance_explained: number
        }[]
      }

    },

    linear_regression_analysis?: {
      regression_result: RegressionResult
    }

  },

  owner: string;
  version: string;
  status: string;
  createdAt: string;
};



export interface RegressionCoefficient {
  variable: string;
  coefficient: number;
  std_error: number;
  t_statistic: number;
  p_value: number;
  significance: string;
}

export interface RegressionResult {
  adjusted_r_squared: number;
  coefficients: RegressionCoefficient[];
  f_p_value: number;
  f_statistic: number;
  hypothesis: string;
  n_observations: number;
  r_squared: number;
  residual_std_error: number;
  source_variable: string;
  target_variable: string;
}

export interface DescriptiveStatistic {
  variable: string;
  count: number;
  mean: number;
  std: number;
  min: number;
  q25: number;
  median: number;
  q75: number;
  max: number;
  skewness: number;
  kurtosis: number;
}

export interface EFAFactor {
  factor_number: number;
  eigenvalue: number;
  variance_explained: number;
  loadings: {
    [variable: string]: number;
  };
}

export interface EFAResult {
  kmo_measure: number;
  bartlett_test_statistic: number;
  bartlett_p_value: number;
  total_variance_explained: number;
  factors: EFAFactor[];
}

export interface CronbachAlpha {
  construct_name: string;
  alpha: number;
  items: string[];
}

export interface PearsonCorrelation {
  variable1: string;
  variable2: string;
  correlation_coefficient: number;
  p_value: number;
  sample_size: number;
  significance: string;
}