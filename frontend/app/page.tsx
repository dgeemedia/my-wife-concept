// app/page.tsx
'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import SuperAdminLanding from '@/components/super-admin/SuperAdminLanding'
import { getSubdomain } from '@/lib/subdomain'

export default function RootPage() {
  const router = useRouter()
  const pathname = usePathname()
  
  useEffect(() => {
    // Only run on client side
    const subdomain = getSubdomain()
    
    console.log(`🔍 RootPage: subdomain=${subdomain}, path=${pathname}`)
    
    if (subdomain && subdomain !== 'platform') {
      // Business subdomain detected
      if (pathname === '/') {
        router.replace('/public-store')
      }
    }
  }, [router, pathname])
  
  // Show SuperAdminLanding for root domain
  return <SuperAdminLanding />
}