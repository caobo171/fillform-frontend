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
  Select,
  Table,
  TableProps,
  TextArea,
} from '@/components/common';
import { FormItem } from '@/components/form/FormItem';
import Avatar from '@/components/ui/Avatar';
import { Code, ROLES } from '@/core/Constants';
import { useQueryString } from '@/hooks/useQueryString';
import Fetch from '@/lib/core/fetch/Fetch';
import { Helper } from '@/services/Helper';
import { AnyObject } from '@/store/interface';
import { RawUser } from '@/store/types';

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
      '/api/user/admin.list ',
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

  const { trigger: updateCoin, isMutating: updating } = useSWRMutation(
    '/api/user/change.coin',
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

  const handleUpdateCoin = useCallback(async () => {
    const coin = Number(coinInputRef.current?.value);

    if (!coin) {
      toast.error('Number of coin must be a number');

      return;
    }

    const res: AnyObject = await updateCoin({
      payload: {
        user_id: selected?.id,
        coin: Number(coinInputRef.current?.value),
        reason: contentRef.current?.value,
      },
    });

    if (res?.data?.code === Code.Error) {
      toast.error(res?.data?.message);
    } else {
      toast.success('Coin has been updated');

      reloadUsers();

      setSelected(undefined);
    }
  }, [reloadUsers, selected?.id, updateCoin]);

  const handleCopyEmail = useCallback((val: string) => {
    navigator.clipboard.writeText(val);

    toast.success('Copied');
  }, []);

  const columns: TableProps<RawUser>['columns'] = useMemo(
    () => [
      {
        title: 'Id',
        key: 'id',
        dataIndex: 'id',
        className: 'w-16',
      },
      {
        title: 'Avatar',
        key: 'avatar',
        className: 'w-16',
        render: (data: RawUser) => (
          <div className="flex gap-2 items-center">
            <Avatar user={data} size={32} />

            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-900">{data.username}</span>

              <span
                aria-hidden="true"
                title="Click to copy email"
                className="text-xs text-gray-500 cursor-pointer"
                onClick={() => handleCopyEmail(data.email)}
              >
                {data.email}
              </span>
            </div>
          </div>
        ),
      },
      {
        title: 'Full name',
        key: 'fullname',
        dataIndex: 'fullname',
      },
      {
        title: 'Join date',
        key: 'since',
        dataIndex: 'since',
        render: (data: RawUser) => Helper.getDay(data.since),
      },
      {
        title: 'Role',
        key: 'role',
        dataIndex: 'role',
        className: 'w-[212px]',
        render: (data: RawUser) => (
          <Select
            onChange={(val) => onRoleChange(data.id, Number(val))}
            value={data.role ?? ROLES.Member}
            className="w-full"
            options={[
              { label: 'Member', value: ROLES.Member },
              { label: 'Admin', value: ROLES.Admin },
              { label: 'Content creator', value: ROLES.ContentCreator },
              { label: 'Teacher', value: ROLES.Teacher },
            ]}
          />
        ),
      },
      {
        title: 'Coin',
        key: 'coin',
        className: 'text-right',
        render: (data: RawUser) => (
          <div className="w-full flex items-center justify-end gap-4">
            <span className="text-sm text-lime-500" title="Wallet 1">
              {data.allowance_coin ?? 0}
            </span>

            <span className="text-sm text-indigo-500" title="Wallet 2">
              {data.earning_coin ?? 0}
            </span>

            <span
              aria-hidden="true"
              onClick={() => setSelected(data)}
              className="text-sm text-gray-500 underline hover:text-gray-900 cursor-pointer"
            >
              Edit coin
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
        title={`Update coin for ${selected?.fullname}`}
        okText="Update"
        onOk={handleUpdateCoin}
        okButtonProps={{ loading: updating }}
      >
        <div className="pt-6 pb-4 text-sm text-gray-900">
          <FormItem
            label="Number of coins will be added/subtracted"
            className="mb-5"
          >
            <Input type="number" ref={coinInputRef} />
          </FormItem>

          <FormItem label="Reason">
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
        <Pagination
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
