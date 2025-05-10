'use client'

import { useState, useEffect } from 'react'
import AffiliateComponent from './Affiliate'
import AffiliateDashboard from './AffiliateDashboard'
import { Loader2 } from 'lucide-react'
import { useMe } from '@/hooks/user'

export default function AffiliateClientWrapper() {
  const { data: user } = useMe()
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    console.log('user', user);
    // Set loading to false once user data is available
    if (user !== undefined) {
      console.log('user', user);
      setLoading(false)
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  // console.log('user', user);

  // If user is not logged in or not an affiliate, show the registration component
  if (!user || !user.isAffiliate) {
    return <AffiliateComponent />
  }

  // If user is an affiliate, show the dashboard
  return <AffiliateDashboard />
}
