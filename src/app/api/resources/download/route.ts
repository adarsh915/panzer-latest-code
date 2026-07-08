import { NextRequest, NextResponse } from 'next/server'
import { incrementResourceDownloadCount, logResourceDownload } from '@/app/admin/resources/resourceStore'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get('id')
  const url = searchParams.get('url')

  if (!id || !url) {
    return new NextResponse('Missing id or url', { status: 400 })
  }

  try {
    // 1. Increment total counter
    await incrementResourceDownloadCount(id)

    // 2. Log individual download with location
    try {
      let ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'
      if (ip.includes(',')) ip = ip.split(',')[0].trim()

      let city = 'Unknown'
      let region = 'Unknown'
      let country = 'Unknown'

      if (ip && ip !== '127.0.0.1' && ip !== '::1') {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}`)
        if (geoRes.ok) {
          const geo = await geoRes.json()
          if (geo.status === 'success') {
            city = geo.city || 'Unknown'
            region = geo.regionName || 'Unknown'
            country = geo.country || 'Unknown'
          }
        }
      } else {
        city = 'Local'
        region = 'Development'
        country = 'Environment'
      }

      await logResourceDownload(id, ip, city, region, country)
    } catch (geoError) {
      console.error('Failed to fetch/log location:', geoError)
    }

  } catch (error) {
    console.error('Failed to increment download count:', error)
  }

  return NextResponse.redirect(new URL(url, request.url))
}
