import {
  ChatBubbleLeftIcon,
  EllipsisVerticalIcon,
  HeartIcon as HeartIconOutline,
  PaperAirplaneIcon,
  ShareIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import Link from 'next/link';
import React, { useState } from 'react';
import { FacebookShareButton } from 'react-share';
import { toast } from 'react-toastify';
import * as uuid from 'uuid';

import { Dropdown, Input, Loading } from '@/components/common';
import Avatar from '@/components/ui/Avatar';
import Constants, { Code, USER_ACTION_METATYPE } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import LogEvent from '@/packages/firebase/LogEvent';
import { Helper } from '@/services/Helper';
import UI from '@/services/UI';
import { MeHook } from '@/store/me/hooks';
import { RawComment, RawUserActionLog } from '@/store/types';
import { UserHook } from '@/store/user/hooks';

import GenerateContent from './_GenerateContent';

interface Props {
  action_log: RawUserActionLog;
  showLoadMoreComment?: boolean;
}

export function ActionLogItem({
  action_log,
  showLoadMoreComment = true,
}: Props) {
  const user = UserHook.useUser(action_log.user_id);
  const me = MeHook.useMe();
  const [open, setOpen] = useState(false);
  const [on_load_comment, setOnLoadComment] = useState(false);
  const [on_load_edit, setOnLoadEdit] = useState(false);
  const [content, setContent] = useState('');
  const [reload, setReload] = useState('');
  const [edit_content, setEditContent] = useState('');
  const [selected_comment_id, setSelectedCommentId] = useState(-1);

  const onComment = async () => {
    LogEvent.sendEvent('new_feeds.comment');
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
      action_log.comments.push(res.data.comment);
      action_log.comment_count += 1;
      setContent('');
      toast.success('comment successful!');
    } else {
      toast.error('Some errors occurred');
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
      action_log.comments.filter(
        (x) => x.id == selected_comment_id
      )[0].content = res.data.comment.content;
      setSelectedCommentId(-1);
      setEditContent('');
      toast.success('Edit comment successful!');
    } else {
      toast.error('Some errors occurred');
    }

    setOnLoadEdit(false);
  };

  const onDeleteComment = async (comment_id: number) => {

    if (typeof (window) !== 'undefined') {
      const result = await window.confirm(
        `Do you want to delete comment  ?${comment_id}`
      );
      if (!result) {
        return;
      }

      const res = await Fetch.postWithAccessToken<{
        code: number;
        comment: RawComment;
      }>('/api/user.action.log/comment.remove', {
        id: comment_id,
      });

      if (res.status == 200 && res.data.code == Code.SUCCESS) {
        action_log.comments = action_log.comments.filter(
          (x) => x.id != comment_id
        );
        action_log.comment_count -= 1;
        setReload(uuid.v4());
        toast.success('Delete successful!');
      } else {
        toast.error('Some errors occurred!');
      }
    }


  };

  const onLike = async () => {
    LogEvent.sendEvent('new_feeds.like');
    if (!me) return;
    const res = await Fetch.postWithAccessToken<{
      code: number;
      action_log: RawUserActionLog;
    }>('/api/user.action.log/like', {
      action_log_id: action_log.id,
    });

    if (res.status == 200 && res.data.code == Code.SUCCESS) {
      if (
        action_log.like_logs.map((x) => x.toString()).includes(me.id.toString())
      ) {
        action_log.like_logs = action_log.like_logs.filter((x) => x != me.id);
        action_log.likes -= 1;
      } else {
        action_log.like_logs.push(me.id);
        action_log.likes += 1;
      }
      setReload(uuid.v4());
    }
  };

  if (!user) {
    return <></>;
  }

  const more_than_five_minutes =
    action_log.end_time &&
    Math.floor((action_log.end_time - action_log.start_time) / 60) > 5;

  if (
    !(
      action_log.metatype != USER_ACTION_METATYPE.METATYPE_LISTENING ||
      more_than_five_minutes
    )
  ) {
    return null;
  }

  return (
    <div className="w-full mb-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        {/* Header Content */}
        <div className="flex gap-2">
          <Avatar user={user} size={40} />

          <div className="flex-1">
            <p className="text-base font-medium mb-1">{user.fullname}</p>

            <p className="text-gray-500 text-xs flex items-center gap-3">
              <span className="whitespace-nowrap">
                {Helper.getExactDay(action_log.start_time)}
              </span>
            </p>
          </div>

          <Dropdown
            popupClassName="min-w-[120px]"
            options={[
              {
                value: 'share',
                label: (
                  <FacebookShareButton
                    url={`${Constants.DOMAIN}/news-feed/${action_log.id}`}
                    className="!px-2 !py-2 !text-left !w-full"
                  >
                    Share
                  </FacebookShareButton>
                ),
                className: 'block text-left px-0 py-0',
              },
              {
                value: 'see_more',
                label: 'See more',
                className: 'block',
                href: `/news-feed/${action_log.id}`,
              },
            ]}
          >
            <div className="p-1 hover:bg-gray-100 rounded-full">
              <EllipsisVerticalIcon className="w-5 h-5" />
            </div>
          </Dropdown>
        </div>

        {/* Body content */}
        <div className="py-4 border-b border-gray-200">
          <GenerateContent action_log={action_log} user={user}/>
        </div>

        {/* Action block */}
        <div className="flex py-2 gap-10 justify-center text-sm font-medium text-gray-700">
          <div
            aria-hidden="true"
            className="flex gap-2 items-center cursor-pointer rounded-lg py-3 px-4 hover:bg-gray-100"
            onClick={onLike}
          >
            {me &&
              action_log.like_logs
                .map((x) => x.toString())
                .includes(me?.id.toString()) ? (
              <HeartIconSolid className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIconOutline className="w-5 h-5 text-gray-900" />
            )}

            <span>{action_log.likes} Likes</span>
          </div>

          <div className="flex gap-2 items-center cursor-pointer rounded-lg py-3 px-4 hover:bg-gray-100">
            <ChatBubbleLeftIcon className="w-5 h-5" />

            <span>{action_log.comment_count} Comments</span>
          </div>

          <FacebookShareButton
            url={`${Constants.DOMAIN}/news-feed/${action_log.id}`}
            className="outline-none focus:outline-none flex gap-2 items-center cursor-pointer rounded-lg !py-3 !px-4 hover:!bg-gray-100"
          >
            <span
              aria-hidden="true"
              onClick={() => LogEvent.sendEvent('new_feeds.share')}
            >
              <ShareIcon className="w-5 h-5" />
            </span>
            Share
          </FacebookShareButton>
        </div>

        <div className="flex-1">
          {me ? (
            <div className="flex gap-2 items-center">
              <Avatar user={me} size={40} />

              <Input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`Comment as ${me?.fullname}`}
                size="large"
                className="flex-1 rounded-full"
              />

              <button
                onClick={() => onComment()}
                className="group text-base w-10 h-10 rounded-full text-gray-700 bg-white flex items-center justify-center border border-gray-300 hover:bg-primary hover:text-white hover:bg-primary"
              >
                {on_load_comment ? (
                  <Loading className="text-primary" />
                ) : (
                  <PaperAirplaneIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Link
                className="text-gray-600 hover:text-gray-700"
                href="/authentication/login"
              >
                You need to login to comment
              </Link>
            </div>
          )}

          <div
            className={
              action_log?.comments?.length ? 'flex flex-col gap-4 mt-8' : ''
            }
          >
            {action_log.comments.map((e, index) => (
              <div className="flex gap-2">
                <Link
                  href={`/profile/${Helper.generateCode(e.user_name ? e.user_name : '')}/${e.user_id}`}
                >
                  <div className="flex-shrink-0">
                    {e.user_avatar ? (
                      <div
                        style={{
                          backgroundImage: `url("${Constants.IMAGE_URL + e.user_avatar}")`,
                        }}
                        className="w-8 h-8 rounded-full bg-center bg-cover"
                      />
                    ) : (
                      <div
                        style={{
                          backgroundColor: UI.getColorByString(e.user_name),
                        }}
                        className="w-8 h-8 rounded-full text-white bg-center bg-cover flex items-center justify-center"
                      >
                        <span className="font-medium">{e.user_name[0]}</span>
                      </div>
                    )}
                  </div>
                </Link>

                <div className="flex-1">
                  <p className="font-medium text-sm mb-1">{e.user_name}</p>
                  <div className="flex w-full items-start">
                    {selected_comment_id != e.id ? (
                      <>
                        <p className="text-sm flex-1">{e.content}</p>
                        {e.user_id == me?.id && (
                          <Dropdown
                            options={[
                              {
                                value: 'edit',
                                label: 'Edit',
                                onClick: () => {
                                  setEditContent(e.content);
                                  setSelectedCommentId(e.id);
                                },
                              },
                              {
                                value: 'delete',
                                label: 'Delete',
                                onClick: () => onDeleteComment(e.id),
                              },
                            ]}
                            className={`h-7 -translate-y-1 z-[${action_log.comments.length - index}]`}
                            popupClassName={`min-w-[120px] z-[${action_log.comments.length - index}]`}
                          >
                            <div className="p-1 hover:bg-gray-100 rounded-full">
                              <EllipsisVerticalIcon className="w-5 h-5" />
                            </div>
                          </Dropdown>
                        )}
                      </>
                    ) : (
                      <div className="flex-1 flex items-center gap-2">
                        <Input
                          value={edit_content}
                          onChange={(e) => setEditContent(e.target.value)}
                          placeholder={`Comment as ${me?.fullname}`}
                          className="flex-1 rounded-full"
                        />

                        <button
                          onClick={() => {
                            onEditComment();
                          }}
                          className="w-8 h-8 rounded-full bg-white hover:bg-primary hover:text-white flex items-center justify-center border border-gray-300 hover:border-primary"
                        >
                          {on_load_edit ? (
                            <Loading className="text-primary" />
                          ) : (
                            <PaperAirplaneIcon className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => {
                            if (on_load_edit) {
                              return;
                            }
                            setEditContent('');
                            setSelectedCommentId(-1);
                          }}
                          className="w-8 h-8 rounded-full bg-white hover:bg-primary hover:text-white flex items-center justify-center border border-gray-300 hover:border-primary"
                        >
                          {on_load_edit ? (
                            <Loading className="text-primary" />
                          ) : (
                            <XMarkIcon className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {showLoadMoreComment && action_log.comments.length > 0 && (
              <div className="">
                <Link
                  className="text-sm text-medium text-gray-500 hover:text-gray-700"
                  href={`/news-feed/${action_log.id}`}
                >
                  View more comments
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
