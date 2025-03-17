'use client';

import * as firestore from 'firebase/firestore';
import * as _ from 'lodash';
import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
import { AiOutlineEdit, AiOutlineLoading3Quarters } from 'react-icons/ai';
import {
  BsFillChatFill,
  BsFillHeartFill,
  BsFilter,
  BsThreeDots,
} from 'react-icons/bs';
import { FiShare2 } from 'react-icons/fi';
import { HiOutlineX } from 'react-icons/hi';
import { IoMdTrash } from 'react-icons/io';
import { IoSend } from 'react-icons/io5';
import { FacebookShareButton } from 'react-share';
import * as uuid from 'uuid';

import { ActionLogItem } from '@/app/(inapp)/news-feed/_components/ActionLogItem';
import { Skeleton } from '@/app/(inapp)/news-feed/_components/Skeleton';
import { UserInfo } from '@/app/(inapp)/news-feed/_components/UserInfo';
import GenerateContent from '@/app/(inapp)/news-feed/_components/_GenerateContent';
import { Input, Loading } from '@/components/common';
import { Container } from '@/components/layout/container/container';
import Avatar from '@/components/ui/Avatar';
import Constants, { Code } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import LogEvent from '@/packages/firebase/LogEvent';
import instanceFirebaseApp from '@/services/Firebase';
import { Helper } from '@/services/Helper';
import { Toast } from '@/services/Toast';
import UI from '@/services/UI';
import { MeHook } from '@/store/me/hooks';
import { RawComment, RawUserActionLog } from '@/store/types';
import { UserHook } from '@/store/user/hooks';

import { RecommendPodcasts } from './RecommendPodcasts';
import GenerateHeader from './_GenerateHeader';

export function NewsFeedDetail({
  action_log,
}: {
  action_log: RawUserActionLog;
}) {
  const user = UserHook.useUser(action_log.user_id);
  UserHook.useFetchUsers([action_log.user_id]);
  const me = MeHook.useMe();
  const [open, setOpen] = useState(-1);
  const [on_load_comment, setOnLoadComment] = useState(false);
  const [on_load_edit, setOnLoadEdit] = useState(false);
  const [content, setContent] = useState('');
  const [reload, setReload] = useState('');
  const [edit_content, setEditContent] = useState('');
  const [selected_comment_id, setSelectedCommentId] = useState(-1);

  const [page, setPage] = useState(1);
  const page_size = 5;
  // const [comments, setComments] = useState<RawComment[]>([])
  const [comments, setComments] = useState<{ [key: number]: any }>({});

  useEffect(() => {
    LogEvent.sendEvent('new_feed_detail.view');
  }, []);

  let observer: () => void;
  useEffect(() => {
    const db = firestore.getFirestore(instanceFirebaseApp());
    const collection = firestore.collection(
      db,
      'comments',
      'user_action_log',
      action_log.id.toString()
    );
    const commentQuery = firestore.query(
      collection,
      firestore.orderBy('since', 'desc'),
      firestore.limit(100)
    );

    let new_value = { ...comments };

    observer = firestore.onSnapshot(commentQuery, async (docSnapshot) => {
      docSnapshot.docChanges().forEach((change) => {
        if (change.type == 'added') {
          const comment = change.doc.data() as RawComment;
          comment.id = parseInt(change.doc.id);

          if (!comments[comment.id]) {
            new_value = {
              ...new_value,
              [comment.id]: comment,
            };
          }
        }

        if (change.type == 'modified') {
          const comment = change.doc.data() as RawComment;
          comment.id = parseInt(change.doc.id);

          new_value = {
            ...new_value,
            [comment.id]: comment,
          };
        }

        if (change.type == 'removed') {
          delete new_value[parseInt(change.doc.id)];
        }
      });

      setComments(new_value);
    });
  }, []);

  const show_comments = useMemo(() => {
    action_log.comment_count = Object.keys(comments).length;
    return Object.values(comments).sort((a, b) => {
      if (a.since > b.since) {
        return -1;
      }

      if (a.since < b.since) {
        return 1;
      }

      return 0;
    }) as RawComment[];
  }, [comments]);

  const onComment = async () => {
    LogEvent.sendEvent('new_feed_detail.comment');
    if (!content) return;
    if (on_load_comment) return;

    setOnLoadComment(true);
    const res = await Fetch.postWithAccessToken<{
      code: number;
      comment: RawComment;
    }>('/api/user.action.log/comment.add', {
      action_log_id: action_log.id,
      content,
    });

    if (res.status == 200 && res.data.code == Code.SUCCESS) {
      // setComments([res.data.comment, ...comments])
      // action_log.comment_count = action_log.comment_count + 1;
      setContent('');
      Toast.success('comment successful!');
    } else {
      Toast.error('Some errors occurred');
    }

    setOnLoadComment(false);
  };

  const onEditComment = async () => {
    if (!edit_content) return;
    if (on_load_edit) return;

    setOnLoadEdit(true);
    const res = await Fetch.postWithAccessToken<{
      code: number;
      comment: RawComment;
    }>('/api/user.action.log/comment.edit', {
      id: selected_comment_id,
      content: edit_content,
    });

    if (res.status == 200 && res.data.code == Code.SUCCESS) {
      // comments.filter(x => x.id == selected_comment_id)[0].content = res.data.comment.content;
      // setComments(comments);
      setSelectedCommentId(-1);
      setEditContent('');
      Toast.success('edit comment successful!');
    } else {
      Toast.error('Some errors occurred');
    }

    setOnLoadEdit(false);
  };


  return (
    <div className="bg-gray-100 mb-[-50px]">
      <Container className="min-h-screen flex flex-col justify-between">
        <div className="w-full mt-8 flex items-start gap-8">
          {me && (
            <div className="hidden xl:block w-3/12">
              <UserInfo data={me} />
            </div>
          )}

          <div id="new-feeds" className="w-full md:w-6/12">
            <ActionLogItem
              action_log={action_log}
              showLoadMoreComment={false}
            />
          </div>

          <div className="hidden xl:block w-3/12">
            <RecommendPodcasts />
          </div>
        </div>
      </Container>
    </div>
  );
}
