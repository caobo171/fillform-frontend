'use client';

import Link from 'next/link';
import { twMerge } from 'tailwind-merge';

export type BlogPostObject = {
  image: string;
  title: string;
  published_at: string;
  author_name: string;
  description: string;
  link: string;
};

function BlogPost({ post }: { post: BlogPostObject }) {
  return (
    <Link
      href={post.link}
      target="_blank"
      className="group w-full flex p-2 gap-3 bg-white rounded-lg border border-gray-100"
    >
      <div
        className="w-[72px] h-[72px] rounded-lg bg-center bg-cover"
        style={{ backgroundImage: `url(${post.image})` }}
      />

      <div className="flex-1 flex flex-col justify-between">
        <h3 className="text-base font-semibold text-gray-900 line-clamp-1 group-hover:underline">
          {post.title}
        </h3>

        <p className="text-sm text-gray-500 line-clamp-2">{post.description}</p>
      </div>
    </Link>
  );
}

type BlogMinimalProps = {
  posts: BlogPostObject[];
  className?: string;
};

export function BlogMinimal({ posts, className }: BlogMinimalProps) {
  return (
    <div className={twMerge('flex flex-col gap-4', className)}>
      <div className="flex justify-between items-end">
        <h3 className="text-base font-semibold text-gray-900">
          Bài viết phổ biến
        </h3>

        <a
          href="https://blog.wele-learn.com/"
          target="_blank"
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Xem thêm
        </a>
      </div>

      <div className="flex flex-wrap gap-2">
        {posts.map((post) => (
          <BlogPost key={post.title} post={post} />
        ))}
      </div>
    </div>
  );
}
