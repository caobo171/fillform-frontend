import {
  ChartPieIcon,
  MinusCircleIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import { isEqual, pullAllBy } from 'lodash';
import Link from 'next/link';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import { toast } from 'react-toastify';

import {
  AutoComplete,
  Button,
  Modal,
  Table,
  TableProps,
} from '@/components/common';
import Avatar from '@/components/ui/Avatar';
import { Code } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import ACL from '@/services/ACL';
import { Helper } from '@/services/Helper';
import { AnyObject } from '@/store/interface';
import { MeHook } from '@/store/me/hooks';
import {
  ExtraPageProps,
  RawUser,
  RawUserClass,
  RawWeleClass,
} from '@/store/types';

type ClassStudentsProps = {
  classData?: RawWeleClass;
  routerGroup?: ExtraPageProps['routerGroup'];
};

export function ClassStudents(props: ClassStudentsProps) {
  const { classData, routerGroup } = props;

  const me = MeHook.useMe();

  const isAdmin = ACL.isAdmin(me);

  const userListRef = useRef<RawUserClass[]>([]);

  const [addingStudent, setAddingStudent] = useState<boolean>(false);

  const [removingStudent, setRemovingStudent] = useState<boolean>(false);

  const [showSearchUserInput, setShowSearchUserInput] =
    useState<boolean>(false);

  const [students, setStudents] = useState<RawUserClass[]>([]);

  const [studentsBackup, setStudentsBackup] = useState<RawUserClass[]>([]);

  const [studentWillBeRemoved, setStudentWillBeRemoved] =
    useState<RawUserClass>();

  useEffect(() => {
    setStudents(classData?.release_members ?? []);

    setStudentsBackup(classData?.release_members ?? []);
  }, [classData]);

  const filterStudents = () => {
    const lazyStudents = studentsBackup.filter(
      (stu: RawUserClass) => !stu?.following?.stats?.submits_num
    );

    setStudents(lazyStudents);
  };

  const clearFilter = () => {
    setStudents(studentsBackup);
  };

  const handleCopyEmail = () => {
    const stringEmails = students
      .map((stu: RawUserClass) => stu.email)
      .join(' ');

    navigator.clipboard.writeText(stringEmails);

    toast.success('Copied');
  };

  const csvData = useMemo(() => {
    if (!students || !students[0]) {
      return [];
    }

    const headers = [
      'Username',
      'Full Name',
      'Email',
      'Address',
      'City',
      'DOB',
      'Description',
      'Gender',
      'Joined',
      'Submissions',
      'Listening Time',
      'Listened Words',
      'Average Accuracy',
    ];

    // the order of value in array should be the same with headers definition
    const studentData = students.map((item) => [
      item.username,
      item.fullname,
      item.email,
      item.address,
      item.city,
      item.dob ? dayjs(item.dob * 1000).format('DD/MM/YYYY') : item.dob,
      item.description,
      item.sex,
      item.since ? dayjs(item.since * 1000).format('DD/MM/YYYY') : item.since,
      item.following?.stats?.submits_num,
      item.following?.stats?.listen_time,
      item.following?.stats?.unique_correct_words_num,
      item.following?.stats?.avg_accuracy,
    ]);

    return [headers, ...studentData];
  }, [students]);

  const getUsers = async (searchString: string) => {
    const result: AnyObject = await Fetch.postWithAccessToken<ResponseType>(
      '/api/user/list.universe',
      {
        q: searchString,
      }
    );

    if (!result?.data?.users) {
      return Promise.resolve([]);
    }

    // save the last search result
    userListRef.current = result.data.users;

    const userList = result.data.users.map((user: RawUserClass) => ({
      value: user.id,
      label: (
        <div className="flex gap-2">
          <Avatar user={user} unlink size={24} />
          <span>{user.fullname}</span>
        </div>
      ),
    }));

    return Promise.resolve(userList);
  };

  const handleAddStudent = async (value: number) => {
    const isAlreadyInClass = !!students?.find((s: RawUser) => s.id === value);

    if (!isAlreadyInClass) {
      const classId = classData?.id;

      setAddingStudent(true);

      const res: AnyObject = await Fetch.postWithAccessToken<RawUserClass>(
        '/api/wele.class/add.member',
        {
          id: classId,
          user_id: value,
        }
      );

      setAddingStudent(false);

      if (!res.error) {
        // if added success, update student list from client-side
        // no need to call api again to re-fresh data because you will have to handle a lot
        const addedUser = userListRef.current.find((item) => item.id === value);

        if (addedUser) {
          setStudents([addedUser, ...students]);
        }
      }

      if (res?.data?.code === Code.Error) {
        toast.error(res?.data?.message);
      } else {
        toast.success('New student has been added');
      }
    } else {
      toast.warning('User already in the class');
    }
  };

  const handleRemoveStudent = async () => {
    const classId = classData?.id;

    const studentId = studentWillBeRemoved?.id;

    setRemovingStudent(true);

    const res: AnyObject = await Fetch.postWithAccessToken<RawUserClass>(
      '/api/wele.class/remove.member',
      {
        id: classId,
        user_id: studentId,
      }
    );

    setRemovingStudent(false);

    if (res?.data?.code === Code.Error) {
      toast.error('Something went wrong');
    } else {
      setStudentWillBeRemoved(undefined);

      toast.success('Removed successfully');

      const newStudentList = pullAllBy(students, [{ id: studentId }], 'id');

      setStudents(newStudentList);
    }
  };

  const columnsStudent: TableProps<RawUserClass>['columns'] = [
    {
      title: 'Name',
      key: 'username',
      className: 'min-w-[200px]',
      sortBy: 'fullname',
      render: (data: RawUserClass) => (
        <Link
          className="flex gap-2 items-center"
          href={`/profile/${data.username}/${data.id}`}
          target="_blank"
        >
          <Avatar user={data} size={30} unlink />
          <span>{data.fullname}</span>
        </Link>
      ),
    },
    {
      title: 'Submissions',
      key: 'submissions',
      dataIndex: 'submissions',
      sortBy: 'submissions',
      sortIteratee: (data: RawUserClass) =>
        data.following?.stats.submits_num || 0,
      render: (data: RawUserClass) => (
        <div className="flex gap-2 items-center">
          {data.following?.stats.submits_num || 0}
        </div>
      ),
    },
    {
      title: 'Listening time',
      key: 'time',
      dataIndex: 'time',
      sortBy: 'time',
      sortIteratee: (data: RawUserClass) =>
        data.following?.stats.listen_time || 0,
      render: (data: RawUserClass) => (
        <div className="flex gap-2 items-center">
          {Helper.getTimeListen(data.following?.stats.listen_time || 0)}
        </div>
      ),
    },
    {
      title: 'Listening words',
      key: 'words',
      dataIndex: 'words',
      sortBy: 'words',
      sortIteratee: (data: RawUserClass) =>
        data.following?.stats.unique_correct_words_num || 0,
      render: (data: RawUserClass) => (
        <div className="flex gap-2 items-center">
          {data.following?.stats.unique_correct_words_num || 0}
        </div>
      ),
    },
    {
      title: 'Average accuracy',
      key: 'accuracy',
      dataIndex: 'accuracy',
      sortBy: 'accuracy',
      sortIteratee: (data: RawUserClass) =>
        data.following?.stats.avg_accuracy || 0,
      render: (data: RawUserClass) => (
        <div className="flex gap-2 items-center">
          {((data.following?.stats.avg_accuracy || 0) * 100).toFixed(2)}%
        </div>
      ),
    },
    {
      title: 'Last active',
      key: 'last_login',
      sortBy: 'last_login',
      sortIteratee: (data: RawUserClass) => data?.data?.last_login || 0,
      render: (data: RawUserClass) =>
        dayjs((data?.data?.last_login ?? 0) * 1000).format('DD/MM/YYYY'),
    },
    {
      title: 'Action',
      key: 'action',
      className: 'w-[120px]',
      render: (data) => (
        <div className="flex gap-3">
          <MinusCircleIcon
            title="Remove"
            className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700"
            onClick={() => setStudentWillBeRemoved(data)}
          />

          <Link
            href={`/${routerGroup}/classes/detail/${classData?.id}/user/${data.id}`}
          >
            <ChartPieIcon
              title="Student detail in class"
              className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700"
            />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <>
      <Modal
        open={!!studentWillBeRemoved}
        onCancel={() => setStudentWillBeRemoved(undefined)}
        title="Confirm remove"
        okText="Remove"
        okButtonProps={{ loading: removingStudent }}
        onOk={handleRemoveStudent}
      >
        <div className="py-4 text-sm text-gray-900">
          <p className="mb-4">
            Are you sure want to remove&nbsp;
            <span className="text-primary">
              {studentWillBeRemoved?.fullname}
            </span>
            ?
          </p>
          <p>
            Remove student out of class might affect class's overall
            performance.
          </p>
        </div>
      </Modal>

      <div className="flex flex-col gap-3 text-sm text-gray-900">
        <div className="flex justify-between items-end gap-4">
          <h3 className="font-semibold flex-1">Students ({students.length})</h3>


            <>
              {!isEqual(students, studentsBackup) ? (
                <div title="Clear filter">
                  <Button
                    type="secondary"
                    className="py-1 gap-1"
                    rounded
                    onClick={clearFilter}
                  >
                    <XMarkIcon className="w-4 h-4 text-gray-900" />
                    Clear filter
                  </Button>
                </div>
              ) : (
                <div title="Who have not completed any assignments yet">
                  <Button
                    type="secondary"
                    className="py-1"
                    rounded
                    onClick={filterStudents}
                  >
                    Filter lazy students
                  </Button>
                </div>
              )}

              {isAdmin && <Button
                type="secondary"
                className="py-1"
                rounded
                onClick={handleCopyEmail}
              >
                Copy email
              </Button>}

              <CSVLink data={csvData} filename="students.csv">
                <Button type="secondary" className="py-1" rounded>
                  Export CSV
                </Button>
              </CSVLink>
            </>
     

          {showSearchUserInput && (
            <AutoComplete
              onFetch={getUsers}
              onSelect={(value) => handleAddStudent(Number(value))}
              inputClassName="py-1"
              placeholder="Search user to add to class"
            />
          )}

          <div
            aria-hidden="true"
            className="outline-none bg-primary rounded-full w-7 h-7 flex items-center justify-center cursor-pointer hover:bg-primary-900"
            onClick={() => setShowSearchUserInput(true)}
            title="Add student"
          >
            <PlusIcon className="w-5 h-5 text-white" />
          </div>
        </div>

        <Table
          columns={columnsStudent}
          data={students}
          loading={addingStudent}
        />
      </div>
    </>
  );
}
