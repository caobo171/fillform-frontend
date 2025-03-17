import Link from 'next/link';
import React from 'react';
// @ts-ignore
import ReactHtmlParser from 'react-html-parser';

import GenerateHeader from '@/app/(inapp)/news-feed/_components/_GenerateHeader';
import Constants, { USER_ACTION_METATYPE } from '@/core/Constants';
import { Helper } from '@/services/Helper';
import { RawUserActionLog } from '@/store/types';

function GenerateContent({ action_log, user }: { action_log: RawUserActionLog, user: any }) {
  const minutes = Math.floor(
    (action_log.end_time - action_log.start_time) / 60
  );

  const renderContent = () => {
    const showedName = user?.fullname || user?.username || action_log.user_name;

    if (action_log.metatype == USER_ACTION_METATYPE.METATYPE_CERTIFICATE) {
      return (
        <>
          <div>{ReactHtmlParser(action_log.content)}</div>
          {action_log.podcast_image ? (
            <div>
              <img
                className="w-80"
                src={Constants.IMAGE_URL + action_log.podcast_image}
                alt=""
              />
            </div>
          ) : (
            <></>
          )}
        </>
      );
    }

    if (action_log.metatype == USER_ACTION_METATYPE.METATYPE_MILESTONE) {
      return (
        <h3 className="text-xl font-medium ">
          Congratulate{' '}
          <span className="text-primary font-medium">
            {showedName}
          </span>{' '}
          for having completed {action_log.content} podcasts
        </h3>
      );
    }

    if (action_log.metatype == USER_ACTION_METATYPE.METATYPE_SUBMIT) {
      return (
        <>
          <p className="" style={{ wordBreak: 'break-word' }}>
            Congratulate{' '}
            <span className="text-primary">{showedName}</span> for
            having successfully submitted podcast{' '}
            <Link
              href={`/podcasts/detail/${Helper.generateCode(action_log.podcast_name)}/${action_log.podcast_id}`}
              target="_blank"
              className="inline text-yellow-600 hover:text-yellow-800"
            >
              {action_log.podcast_name}
              {` ${action_log.podcast_sub_name}`}
            </Link>
            &nbsp; after{' '}
            {(JSON.parse(action_log.content).total_time / 60).toFixed(2)}{' '}
            minutes of listening
          </p>
          <div className="mt-4" />
        </>
      );
    }

    if (action_log.metatype == USER_ACTION_METATYPE.METATYPE_LISTENING) {
      return (
        <div className="flex flex-col gap-3">
          <GenerateHeader action_log={action_log} />
          <img
            className="w-80"
            src={`${Constants.IMAGE_URL + action_log.podcast_image}`}
            alt=""
          />
        </div>
      );
    }

    if (action_log.metatype == USER_ACTION_METATYPE.METATYPE_REVIEW) {
      return (
        <p className="font-medium ">
          Chúc mừng{' '}
          <span className="text-primary font-medium">
            {showedName}
          </span>{' '}
          .Mỗi ngày cải thiện từng tí một rồi mình sẽ giỏi lên thôi
        </p>
      );
    }

    if (
      action_log.metatype == USER_ACTION_METATYPE.METATYPE_SYSTEM ||
      action_log.metatype == USER_ACTION_METATYPE.METATYPE_SHARE_SOCIAL
    ) {
      return (
        <>
          <p className="text-base ">{action_log.content}</p>
          <div className="mt-4">
            <img
              className="w-80"
              src={`${Constants.IMAGE_URL + action_log.podcast_image}`}
              alt=""
            />
          </div>
        </>
      );
    }
  };

  return (
    <div className="text-sm text-gray-700 newsfeed-post-content">
      {renderContent()}
    </div>
  );
}

export default GenerateContent;
