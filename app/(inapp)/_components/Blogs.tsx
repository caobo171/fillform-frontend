'use client';

import { CalendarIcon } from '@heroicons/react/24/outline';
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
      className="group w-[280px] flex flex-col p-4 gap-4 bg-white rounded-lg border border-gray-100"
    >
      <div
        className="w-[248px] h-[248px] rounded-lg bg-center bg-cover"
        style={{ backgroundImage: `url(${post.image})` }}
      />

      <div className="h-12">
        <h3 className="text-base font-medium text-gray-900 line-clamp-2 group-hover:underline">
          {post.title}
        </h3>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-700 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          {post.published_at}
        </p>

        <span className="w-4 h-[1px] bg-gray-700" />

        <p className="text-sm text-gray-700">{post.author_name}</p>
      </div>

      <p className="text-sm text-gray-500 line-clamp-4">{post.description}</p>
    </Link>
  );
}

type BlogsProps = {
  posts: BlogPostObject[];
  className?: string;
};

export function Blogs({ posts, className }: BlogsProps) {
  return (
    <div className={twMerge('flex flex-col gap-4', className)}>
      <h3 className="text-base font-semibold text-gray-900">
        Bài viết liên quan
      </h3>

      <div className="flex flex-wrap gap-4">
        {posts.map((post) => (
          <BlogPost key={post.title} post={post} />
        ))}
      </div>
    </div>
  );
}
