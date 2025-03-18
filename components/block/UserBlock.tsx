import { RawUser } from '@/store/types';
import Avatar from '@/components/ui/Avatar';
import { Skeleton } from '../ui/skeleton';

export function UserBlock(props: { user: RawUser }) {
  return (
    <div className="items-center flex cursor-pointer">
      <Avatar unlink className={'inline-block'} user={props.user} />
      <span className="truncate font-medium ml-1 text-base">{props.user.username}</span>
    </div>
  );
}

export function UserBlockSkeleton() {
  return (
    <div className="items-center flex cursor-pointer">
      <Skeleton className="h-8 w-8 rounded-full mr-2" />
      {/*<Skeleton className="h-6 w-[120px]" />*/}
    </div>
  );
}
