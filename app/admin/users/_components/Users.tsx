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
import { LocalPagination } from '@/components/common/LocalPagination';
export default function Users() {
  const pageSize = 20;

  const searchParams = useSearchParams();

  const router = useRouter();

  const pathname = usePathname();

  const { createQueryString } = useQueryString();

  const coinInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [currentPage, setCurrentPage] = useState<number>(() =>
    Number(searchParams.get('page') ?? 1)
  );

  const [query, setQuery] = useState<string | null>(() =>
    searchParams.get('query')
  );

  const [selected, setSelected] = useState<RawUser>();

  const {
    data: usersData,
    isLoading,
    isValidating,
    mutate: reloadUsers,
  } = useSWR(
    [
      '/api/user/list ',
      {
        q: query,
        page: currentPage,
        page_size: pageSize,
      },
    ],
    Fetch.getFetcher.bind(Fetch)
  );

  const { trigger: updateRole } = useSWRMutation(
    '/api/user/change.role',
    Fetch.postFetcher.bind(Fetch)
  );

  const { trigger: addCredit, isMutating: addingCredit } = useSWRMutation(
    '/api/user/add.credit',
    Fetch.postFetcher.bind(Fetch)
  );

  const users = useMemo(() => {
    const rawData = usersData?.data as AnyObject;

    return {
      users: rawData?.users ?? [],
      user_num: rawData?.user_num ?? 0,
    };
  }, [usersData]);

  const onRoleChange = useCallback(
    async (user_id: number, role: number) => {
      const res: AnyObject = updateRole({ payload: { user_id, role } });

      if (res?.data?.code === Code.Error) {
        toast.error(res?.data?.message);
      } else {
        toast.success('Role has been updated');
      }
    },
    [updateRole]
  );

  const onPageChange = useCallback(
    (value: number) => {
      setCurrentPage(value);

      router.push(`${pathname}?${createQueryString('page', String(value))}`);
    },
    [createQueryString, pathname, router]
  );

  const handleSearch = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const { value } = e.currentTarget;

        setQuery(value);

        router.push(`${pathname}?${createQueryString('query', String(value))}`);
      }
    },
    [createQueryString, pathname, router]
  );

  const handleAddCredit = useCallback(async () => {
    const credit = Number(coinInputRef.current?.value);

    if (!credit) {
      toast.error('Number of credit must be a number');

      return;
    }

    const res: AnyObject = await addCredit({
      payload: {
        user_id: selected?.id,
        credit: Number(coinInputRef.current?.value),
        message: contentRef.current?.value,
      },
    });

    if (res?.data?.code === Code.Error) {
      toast.error(res?.data?.message);
    } else {
      toast.success('Credit has been added');

      reloadUsers();

      setSelected(undefined);
    }
  }, [reloadUsers, selected?.id, addCredit]);

  const handleCopyEmail = useCallback((val: string) => {
    navigator.clipboard.writeText(val);

    toast.success('Copied');
  }, []);

  const columns: TableProps<RawUser>['columns'] = useMemo(
    () => [
      {
        title: 'Id Credit',
        key: 'idcredit',
        dataIndex: 'idcredit',
        className: '',
      },

      {
        title: 'Username',
        key: 'username',
        dataIndex: 'username',
        className: 'text-right',
        render: (data: RawUser) => (
          <Link href={`/admin/users/${data.id}`} className="w-full flex items-center justify-end gap-4">
            {data.username}
          </Link>
        ),
      },

      {
        title: 'Email',
        key: 'email',
        dataIndex: 'email',
        className: 'text-right',
        render: (data: RawUser) => (
          <div className="w-full flex items-center justify-end gap-4">
            {data.email}
          </div>
        ),
      },

      {
        title: 'Ngày đăng ký',
        key: 'created_at',
        className: 'text-right',
        render: (data: RawUser) => (
          <div className="w-full flex items-center justify-end gap-4">
            {new Date(data.createdAt).toLocaleDateString()}
          </div>
        ),
      },

      {
        title: 'Số dư',
        key: 'credit',
        className: 'text-right',
        render: (data: RawUser) => (
          <div className="w-full flex items-center justify-end gap-4">
            {data.credit.toLocaleString()} VND
          </div>
        ),
      },

      {
        title: 'Credit',
        key: 'credit',
        className: 'text-right',
        render: (data: RawUser) => (
          <div className="w-full flex items-center justify-end gap-4">
            <span
              aria-hidden="true"
              onClick={() => setSelected(data)}
              className="text-sm text-gray-500 underline hover:text-gray-900 cursor-pointer"
            >
              Add credit
            </span>

            <span
              aria-hidden="true"
              onClick={() => router.push(`/admin/users/${data.id}`)}
              className="text-sm text-gray-500 underline hover:text-gray-900 cursor-pointer"
            >
              View detail 
            </span>
          </div>
        ),
      },
    ],
    [onRoleChange]
  );

  return (
    <>
      <Modal
        open={!!selected}
        onCancel={() => setSelected(undefined)}
        title={`Add credit for ${selected?.username}`}
        okText="Add"
        onOk={handleAddCredit}
        okButtonProps={{ loading: addingCredit }}
      >
        <div className="pt-6 pb-4 text-sm text-gray-900">
          <FormItem
            label="Number of coins will be added/subtracted"
            className="mb-5"
          >
            <Input type="number" ref={coinInputRef} />
          </FormItem>

          <FormItem label="Message">
            <TextArea ref={contentRef} />
          </FormItem>
        </div>
      </Modal>

      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            Users
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all users in the app.
          </p>
        </div>

        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Input
            onKeyDown={handleSearch}
            className="w-[200px]"
            placeholder="Search for users"
            prefixIcon={
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            }
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={users?.users}
        loading={isLoading || isValidating}
      />

      {users && users.user_num > pageSize && (
        <LocalPagination
          total={users?.user_num ?? 0}
          pageSize={pageSize}
          current={currentPage}
          className="mt-6"
          onChange={onPageChange}
        />
      )}
    </>
  );
}
