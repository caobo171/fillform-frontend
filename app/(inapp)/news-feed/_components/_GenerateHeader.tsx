import Link from 'next/link';

import { USER_ACTION_METATYPE } from '@/core/Constants';
import { Helper } from '@/services/Helper';
import { RawUserActionLog } from '@/store/types';

function GenerateHeader({ action_log }: { action_log: RawUserActionLog }) {
  const renderContent = () => {
    if (action_log.metatype == USER_ACTION_METATYPE.METATYPE_CERTIFICATE) {
      return (
        <span className="text-green-600">Get a special certification</span>
      );
    }

    if (action_log.metatype == USER_ACTION_METATYPE.METATYPE_MILESTONE) {
      return (
        <span className="text-green-600">
          Completed {action_log.content} podcasts
        </span>
      );
    }

    if (action_log.metatype == USER_ACTION_METATYPE.METATYPE_LISTENING) {
      return (
        <>
          {action_log.end_time &&
          Math.floor((action_log.end_time - action_log.start_time) / 60) >
            10 ? (
            <>
              Has listened to podcast{' '}
              <Link
                href={`/podcasts/detail/${Helper.generateCode(action_log.podcast_name)}/${action_log.podcast_id}`}
                target="_blank"
                className="inline text-yellow-600 hover:text-yellow-700"
              >
                {action_log.podcast_name}
                {` ${action_log.podcast_sub_name}`}
              </Link>{' '}
              for{' '}
              {Math.floor((action_log.end_time - action_log.start_time) / 60)}{' '}
              minutes
            </>
          ) : (
            <>
              Started listening to podcast{' '}
              <Link
                href={`/podcasts/detail/${Helper.generateCode(action_log.podcast_name)}/${action_log.podcast_id}`}
                target="_blank"
                className="inline text-yellow-600 hover:text-yellow-700"
              >
                {action_log.podcast_name}
                {` ${action_log.podcast_sub_name}`}
              </Link>
            </>
          )}
        </>
      );
    }

    if (action_log.metatype == USER_ACTION_METATYPE.METATYPE_SUBMIT) {
      return (
        <>
          Submitted{' '}
          <Link
            href={`/podcasts/detail/${Helper.generateCode(action_log.podcast_name)}/${action_log.podcast_id}`}
            target="_blank"
            className="inline text-yellow-600 hover:text-yellow-700"
          >
            {action_log.podcast_name}
            {` ${action_log.podcast_sub_name}`}
          </Link>
        </>
      );
    }

    if (action_log.metatype == USER_ACTION_METATYPE.METATYPE_REVIEW) {
      return <>Completed today's review exercises</>;
    }

    if (action_log.metatype == USER_ACTION_METATYPE.METATYPE_SYSTEM) {
      return action_log.content;
    }
  };

  return <span className="line-clamp-1">{renderContent()}</span>;
}

export default GenerateHeader;
