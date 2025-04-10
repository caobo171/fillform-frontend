import { NextRequest, NextResponse } from 'next/server';

import Constants from './core/Constants';
import Fetch from './lib/core/fetch/Fetch';
import ACL from './services/ACL';
import { RawUser } from './store/types';

const publicLinks = [
  '/notfound',
  '/billboard',
  '/news-feed',
  '/profile',
  '/podcasts',
  '/pricing',
  '/challenges',
  '/mobile/profile',
  '/robots.txt',
  '/sitemap.xml',
  '/privacy',
  '/terms',
];

const loginLinks = ['/authentication'];

const authLinks = ['/podcasts/listen'];

const adminLinks = ['/admin'];

export default async function middleware(req: NextRequest) {
  // Get the pathname of the request (e.g. /, /protected)
  const path = req.nextUrl.pathname;

  const host = req.headers.get('host');

  const urlSearchParams = new URLSearchParams(req.nextUrl.search);

  if (req.nextUrl.searchParams.get('access_token')) {
    req.cookies.set(
      'access_token',
      req.nextUrl.searchParams.get('access_token') || ''
    );
  }
  // If it's the root path, just render it
  if (
    publicLinks.some((e) => path.startsWith(e)) &&
    !authLinks.some((e) => path.startsWith(e))
  ) {
    return NextResponse.next();
  }

  let user = null;

  try {
    const res = await Fetch.postWithAccessToken<{
      user: RawUser;
      code: number;
    }>(
      '/api/me/profile',
      {},
      {
        access_token: req.cookies.get('access_token')?.value || '',
      },
      false,
      true
    );

    if (res && res.data.user) {
      user = res.data.user;

      req.cookies.set('user', JSON.stringify(res.data.user));

      if (adminLinks.some((e) => path.startsWith(e))) {
        if (!ACL.isAdmin(user)) {
          return NextResponse.redirect(new URL('/', req.url));
        }
      }

      if (loginLinks.some((e) => path.startsWith(e))) {
        return NextResponse.redirect(new URL('/', req.url));
      }

      return NextResponse.next();
    }

    if (loginLinks.some((e) => path.startsWith(e))) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/authentication/login', req.url));
  } catch (err) {
    if (loginLinks.some((e) => path.startsWith(e))) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/authentication/login', req.url));
  }
}

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ['/((?!static|_next/static|_next/image|favicon.ico).*)'],
};
