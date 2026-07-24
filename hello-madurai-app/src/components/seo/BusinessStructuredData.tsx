'use client'

interface Business {
  id: string
  slug?: string
  name: string
  name_ta?: string
  address: string
  address_ta?: string
  phone?: string
  email?: string
  website?: string
  mainImage?: string
  latitude?: number
  longitude?: number
  verified: boolean
}

interface BusinessStructuredDataProps {
  business: Business
}

export default function BusinessStructuredData({ business }: BusinessStructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hello-madurai-c5xr.vercel.app'
  
  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": business.name,
    "alternateName": business.name_ta,
    "image": business.mainImage 
      ? (business.mainImage.startsWith('http') 
          ? business.mainImage 
          : `${baseUrl}${business.mainImage}`)
      : `${baseUrl}/logo.jpg`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": business.address,
      "addressLocality": "Madurai",
      "addressRegion": "Tamil Nadu",
      "addressCountry": "IN",
      "postalCode": "625001"
    },
    ...(business.latitude && business.longitude && {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": business.latitude,
        "longitude": business.longitude
      }
    }),
    ...(business.phone && { "telephone": business.phone }),
    ...(business.email && { "email": business.email }),
    ...(business.website && { "url": business.website }),
    "priceRange": "$$",
    "areaServed": {
      "@type": "City",
      "name": "Madurai"
    },
    "hasMap": business.latitude && business.longitude 
      ? `https://www.google.com/maps?q=${business.latitude},${business.longitude}`
      : undefined
  }

  // Breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Directory",
        "item": `${baseUrl}/directory`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": business.name,
        "item": `${baseUrl}/directory/${business.slug || business.id}`
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  )
}
