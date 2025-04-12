'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import {
    Input,
    Modal,
    Pagination,
    Table,
    TableProps,
    TextArea,
} from '@/components/common';
import { FormItem } from '@/components/form/FormItem';
import { Code } from '@/core/Constants';
import { useQueryString } from '@/hooks/useQueryString';
import Fetch from '@/lib/core/fetch/Fetch';
import { AnyObject } from '@/store/interface';
import { RawUser } from '@/store/types';
import Link from 'next/link';
import OrderLists from '@/app/(inapp)/_sections/OrderLists';
import FormLists from '@/app/(inapp)/_sections/FormLists';
export default function Orders() {


    return (
        <>



            <FormLists admin={true} />

        </>
    );
}
