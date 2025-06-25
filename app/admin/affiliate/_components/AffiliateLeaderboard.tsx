'use client';

import React, { useMemo } from 'react';
import useSWR from 'swr';
import { Loader2 } from 'lucide-react';
import Fetch from '@/lib/core/fetch/Fetch';
import { Code } from '@/core/Constants';
import { RawUser } from '@/store/types';

type LeaderboardUser = RawUser & {
  rank?: number;
};

export default function AffiliateLeaderboard() {
  // Fetch top 100 users with most referCredit
  const { data: leaderboardData, isLoading } = useSWR(
    '/api/affiliate/leaderboard',
    Fetch.getFetcher.bind(Fetch)
  );

  const users = useMemo(() => {
    if (!leaderboardData?.data?.users) return [];
    
    // Add rank to each user
    return leaderboardData.data.users.map((user: RawUser, index: number) => ({
      ...user,
      rank: index + 1
    }));
  }, [leaderboardData]);

  // Function to determine background color based on rank
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500'; // Gold for 1st
    if (rank === 2) return 'bg-gray-400'; // Silver for 2nd
    if (rank === 3) return 'bg-amber-600'; // Bronze for 3rd
    return 'bg-blue-500'; // Default blue for others
  };
  
  // Function to determine podium color based on rank
  const getPodiumColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-200'; // Gold for 1st
    if (rank === 2) return 'bg-gray-200'; // Silver for 2nd
    if (rank === 3) return 'bg-amber-200'; // Bronze for 3rd
    return 'bg-blue-100'; // Default blue for others
  };

  // Function to determine avatar size based on rank
  const getAvatarSize = (rank: number) => {
    if (rank === 1) return 'w-36 h-36'; // Largest for 1st
    if (rank === 2) return 'w-28 h-28'; // Medium for 2nd
    if (rank === 3) return 'w-24 h-24'; // Smallest for 3rd
    return 'w-12 h-12'; // Default size for others
  };

  // Function to determine rank badge size based on rank
  const getBadgeSize = (rank: number) => {
    if (rank === 1) return 'w-12 h-12'; // Largest for 1st
    if (rank === 2) return 'w-10 h-10'; // Medium for 2nd
    if (rank === 3) return 'w-8 h-8'; // Smallest for 3rd
    return 'w-6 h-6'; // Default size for others
  };

  // Function to get the first letter of username for avatar
  const getInitial = (username: string) => {
    return username.charAt(0).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Top Affiliate Users</h2>
        <p className="mt-1 text-sm text-gray-500">
          Users ranked by highest referral credits earned
        </p>
      </div>

      {users.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No affiliate users found
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* Top 3 users with special display */}
          {users.length > 0 && (
            <div className="relative flex flex-wrap justify-center items-end gap-16 py-12 px-6 bg-gray-50">
              {/* Display top 3 users with podium effect but aligned at bottom */}
              <div className="relative w-full flex justify-center mb-4">
                {/* Position blocks to create podium effect */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-44 h-28 bg-yellow-200 rounded-t-lg z-0 border border-yellow-300 shadow-inner"></div>
                <div className="absolute bottom-0 left-1/4 w-36 h-20 bg-gray-200 rounded-t-lg z-0 border border-gray-300 shadow-inner"></div>
                <div className="absolute bottom-0 right-1/4 w-36 h-16 bg-amber-200 rounded-t-lg z-0 border border-amber-300 shadow-inner"></div>
              </div>
              
              {/* Reorder users to show 2nd, 1st, 3rd */}
              {[...users]
                .slice(0, 3)
                .sort((a, b) => {
                  // Custom sort to place 1st in middle, 2nd on left, 3rd on right
                  if ((a.rank === 1 && b.rank === 2) || (a.rank === 3 && b.rank === 2)) return 1;
                  if ((a.rank === 2 && b.rank === 1) || (a.rank === 2 && b.rank === 3)) return -1;
                  if (a.rank === 1 && b.rank === 3) return -1;
                  if (a.rank === 3 && b.rank === 1) return 1;
                  return 0;
                })
                .map((user: LeaderboardUser) => {
                  const isFirst = user.rank === 1;
                  return (
                    <div key={user.id} className={`flex flex-col items-center ${isFirst ? 'order-2 z-10' : user.rank === 2 ? 'order-1 z-10' : 'order-3 z-10'} relative`}>
                      <div className={`relative ${getRankColor(user.rank || 0)} rounded-full ${getAvatarSize(user.rank || 0)} flex items-center justify-center text-white ${isFirst ? 'text-4xl' : user.rank === 2 ? 'text-2xl' : 'text-xl'} font-bold shadow-xl border-4 border-white`}>
                        {getInitial(user.username)}
                        <div className={`absolute -bottom-3 -right-3 bg-white rounded-full ${getBadgeSize(user.rank || 0)} flex items-center justify-center ${isFirst ? 'text-base' : user.rank === 2 ? 'text-sm' : 'text-xs'} font-bold border-2 ${user.rank === 1 ? 'border-yellow-400' : user.rank === 2 ? 'border-gray-400' : 'border-amber-400'} shadow-md`}>
                          {user.rank}
                        </div>
                      </div>
                      <div className="mt-6 text-center">
                        <p className={`font-semibold text-gray-900 truncate max-w-[140px] ${isFirst ? 'text-lg' : user.rank === 2 ? 'text-base' : 'text-sm'}`}>{user.username}</p>
                        <p className={`${isFirst ? 'text-lg font-bold' : user.rank === 2 ? 'text-base' : 'text-sm'} font-medium text-yellow-600`}>{user.referCredit?.toLocaleString()} ₫</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Table for all users */}
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referral Credit
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user: LeaderboardUser) => (
                <tr key={user.id} className={user.rank && user.rank <= 3 ? 'bg-yellow-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`flex items-center justify-center ${user.rank && user.rank <= 3 ? getBadgeSize(user.rank) : 'w-6 h-6'} rounded-full text-xs font-medium text-white ${getRankColor(user.rank || 0)}`}>
                        {user.rank}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-2">
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <span className="font-semibold text-yellow-600">{user.referCredit?.toLocaleString()} ₫</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
