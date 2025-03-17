import {
  ArrowPathIcon,
  MinusCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { AxiosResponse } from 'axios';
import dayjs from 'dayjs';
import { isEqual } from 'lodash';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CSVLink } from 'react-csv';
import { toast } from 'react-toastify';
import { KeyedMutator } from 'swr';
import useSWRMutation from 'swr/mutation';

import { ClassApi } from '@/app/admin/classes/classApi';
import {
  Button,
  Dropdown,
  Modal,
  Table,
  TableProps,
} from '@/components/common';
import Avatar from '@/components/ui/Avatar';
import { Code } from '@/core/Constants';
import { useUsers } from '@/hooks/user';
import Fetch from '@/lib/core/fetch/Fetch';
import ACL from '@/services/ACL';
import { Helper } from '@/services/Helper';
import { AnyObject } from '@/store/interface';
import { MeHook } from '@/store/me/hooks';
import { RawUserClass } from '@/store/types';

type StudentListProps = {
  assignment: AnyObject;
  weleClass: AnyObject;
  isOverdue: boolean;
  reloadAssignment: KeyedMutator<AxiosResponse<unknown, AnyObject>>;
};

export function StudentList({
  assignment,
  weleClass,
  isOverdue,
  reloadAssignment,
}: StudentListProps) {
  const me = MeHook.useMe();

  const isAdmin = useMemo(() => ACL.isAdmin(me), [me]);

  const userListRef = useRef<RawUserClass[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

  const [students, setStudents] = useState<RawUserClass[]>([]);

  const [studentWillBeRemoved, setStudentWillBeRemoved] =
    useState<RawUserClass>();

  const [studentsBackup, setStudentsBackup] = useState<RawUserClass[]>([]);

  const { trigger: addStudent } = useSWRMutation(
    ClassApi.AssignmentAddStudent,
    Fetch.postFetcher.bind(Fetch)
  );

  const { trigger: removeStudent, isMutating: removingStudent } =
    useSWRMutation(
      ClassApi.AssignmentRemoveStudent,
      Fetch.postFetcher.bind(Fetch)
    );

  const { trigger: syncResult } = useSWRMutation(
    ClassApi.AssignmentSyncResult,
    Fetch.postFetcher.bind(Fetch)
  );

  useEffect(() => {
    setStudents(assignment.release_members ?? []);

    setStudentsBackup(assignment?.release_members ?? []);
  }, [assignment]);

  // get all student in the class
  const studentIds = useMemo(() => {
    if (Array.isArray(weleClass?.members)) {
      return weleClass.members.map((item: { user_id: string }) =>
        Number(item.user_id)
      );
    }

    return null;
  }, [weleClass?.members]);

  const { data: userList } = useUsers(studentIds ?? []);

  const studentOptions = useMemo(() => {
    if (!Array.isArray(userList)) {
      return [];
    }

    userListRef.current = userList;

    return userList.map((item: RawUserClass) => ({
      value: item.id,
      label: (
        <div className="flex gap-2">
          <Avatar user={item} unlink size={24} />
          <span className="text-left">{item.fullname}</span>
        </div>
      ),
    }));
  }, [userList]);

  const syncStudentResult = useCallback(
    async (user: RawUserClass) => {
      setLoading(true);

      const res: AnyObject = await syncResult({
        payload: { user_id: user.id, assignment_id: assignment.id },
      });

      if (res?.data?.code === Code.Error) {
        toast.error(res?.data?.message);
      } else {
        toast.success('Synced successfully');

        await reloadAssignment();
      }

      setLoading(false);

      return res?.data ?? {};
    },
    [assignment.id, reloadAssignment, syncResult]
  );

  const handleAddStudent = useCallback(
    async (value: number | string) => {
      const isAlreadyInClass = !!students.find(
        (s: RawUserClass) => String(s.id) === String(value)
      );

      if (!isAlreadyInClass) {
        setLoading(true);

        const assignmentId = assignment.id;

        const res: AnyObject = await addStudent({
          payload: { id: assignmentId, user_ids: String(value) },
        });

        if (res?.data?.code === Code.Error) {
          toast.error(res?.data?.message);
        } else {
          toast.success('New student has been added');

          await reloadAssignment();
        }

        setLoading(false);
      } else {
        toast.warning('Student has already been assigned');
      }
    },
    [addStudent, assignment.id, reloadAssignment, students]
  );

  const handleAssignToAllStudent = useCallback(async () => {
    const ids = userListRef.current.map((item) => item.id).join(',');

    await handleAddStudent(ids);
  }, [handleAddStudent]);

  const handleRemoveStudent = useCallback(async () => {
    setLoading(true);

    const assignmentId = assignment?.id;

    const studentId = studentWillBeRemoved?.id;

    const res: AnyObject = await removeStudent({
      payload: { id: assignmentId, user_id: studentId },
    });

    if (res?.data?.code === Code.Error) {
      toast.error(res?.data?.message ?? 'Something went wrong!');
    } else {
      setStudentWillBeRemoved(undefined);

      toast.success('Removed successfully');

      await reloadAssignment();
    }

    setLoading(false);
  }, [
    assignment?.id,
    reloadAssignment,
    removeStudent,
    studentWillBeRemoved?.id,
  ]);

  const filterStudents = useCallback(() => {
    const lazyStudents = studentsBackup.filter(
      (stu: RawUserClass) => !stu?.following?.stats?.submits_num
    );

    setStudents(lazyStudents);
  }, [studentsBackup]);

  const clearFilter = useCallback(() => {
    setStudents(studentsBackup);
  }, [studentsBackup]);

  const handleCopyEmail = useCallback(() => {
    const stringEmails = students
      .map((stu: RawUserClass) => stu.email)
      .join(' ');

    navigator.clipboard.writeText(stringEmails);

    toast.success('Copied');
  }, [students]);

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

  const columnsStudent: TableProps<RawUserClass>['columns'] = useMemo(
    () => [
      {
        title: 'Name',
        key: 'image_url',
        className: 'min-w-[200px]',
        sortBy: 'fullname',
        render: (data: RawUserClass) => (
          <div className="flex gap-2 items-center">
            <Avatar user={data} size={30} />
            <span>{data.fullname}</span>
          </div>
        ),
      },
      {
        title: 'Status',
        key: 'status',
        dataIndex: 'status',
        sortBy: 'status',
        sortIteratee: (data: RawUserClass) =>
          data.following?.stats.submits_num || 0,
        render: (data: RawUserClass) => {
          if (!assignment?.release_podcasts?.length) {
            return '--';
          }

          return (
            <div className="flex gap-2 items-center">
              {data.following?.stats.submits_num || 0} /{' '}
              {assignment?.release_podcasts?.length || '0'}
            </div>
          );
        },
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
        title: 'Action',
        key: 'action',
        className: 'w-[120px]',
        render: (data: RawUserClass) => (
          <div className="flex gap-3">
            <MinusCircleIcon
              title="Remove"
              className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700"
              onClick={() => setStudentWillBeRemoved(data)}
            />

            <ArrowPathIcon
              title="Sync"
              className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700"
              onClick={() => syncStudentResult(data)}
            />
          </div>
        ),
      },
    ],
    [assignment?.release_podcasts?.length, syncStudentResult]
  );

  return (
    <>
      <Modal
        open={!!studentWillBeRemoved}
        onCancel={() => setStudentWillBeRemoved(undefined)}
        title="Confirm remove student"
        onOk={handleRemoveStudent}
        okButtonProps={{ loading: removingStudent }}
        okText="Remove"
      >
        <p className="text-sm text-gray-900 py-4">
          Are you sure want to remove&nbsp;
          <span className="text-primary">{studentWillBeRemoved?.fullname}</span>
          ?
        </p>
      </Modal>

      <div className="flex flex-col gap-3 text-sm text-gray-900">
        <div className="flex justify-between items-end gap-4">
          <h3 className="font-semibold flex-1">Students ({students.length})</h3>

          {isAdmin && (
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

              <Button
                type="secondary"
                className="py-1"
                rounded
                onClick={handleCopyEmail}
              >
                Copy email
              </Button>
              {/**@ts-ignore */}
              <CSVLink data={csvData} filename="students.csv">
                <Button type="secondary" className="py-1" rounded>
                  Export CSV
                </Button>
              </CSVLink>
            </>
          )}

          {!isOverdue && (
            <>
              <Dropdown
                buttonClassName="py-1"
                popupClassName="min-w-[200px] max-h-[400px] custom-scrollbar overflow-y-auto"
                options={studentOptions}
                buttonText="Assign to"
                onClickItem={(val: string | number | boolean) =>
                  handleAddStudent(String(val))
                }
              />

              <Button
                size="small"
                type="outline"
                className="py-1"
                onClick={handleAssignToAllStudent}
              >
                Assign to all students
              </Button>
            </>
          )}
        </div>

        <Table columns={columnsStudent} data={students} loading={loading} />
      </div>
    </>
  );
}
