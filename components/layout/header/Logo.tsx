import Link from 'next/link';
import React from 'react';

export function Logo() {
  return (
    <Link href="/home">
      <span className="sr-only">Wele Learn</span>
      <img className="h-8 w-auto" src="/static/logo.svg" alt="" />
    </Link>
  );
}
