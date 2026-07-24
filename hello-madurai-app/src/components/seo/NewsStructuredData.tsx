'use client'

interface NewsArticle {
  id: string
  slug?: string
  title: string
  title_ta?: string
  excerpt: string
  excerpt_ta?: string
  content: string
  author: string
  publishedAt: string
  updatedAt?: string
  featuredImage?: string
  category: string
}

interface NewsStructuredDataProps {
  article: NewsArticle
}

export default function NewsStructuredData({ article }: NewsStructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hello-madurai-c5xr.vercel.app'
  
  const newsArticleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "alternativeHeadline": article.title_ta,
    "image": article.featuredImage 
      ? (article.featuredImage.startsWith('http') 
          ? article.featuredImage 
          : `${baseUrl}${article.featuredImage}`)
      : `${baseUrl}/logo.jpg`,
    "author": {
      "@type": "Person",
      "name": article.author,
      "url": `${baseUrl}/reporters/${article.author.toLowerCase().replace(/\s+/g, '-')}`
    },
    "publisher": {
      "@type": "Organization",
      "name": "Hello Madurai",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.jpg`,
        "width": 600,
        "height": 60
      },
      "url": baseUrl,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Madurai",
        "addressRegion": "Tamil Nadu",
        "addressCountry": "IN"
      }
    },
    "datePublished": article.publishedAt,
    "dateModified": article.updatedAt || article.publishedAt,
    "inLanguage": ["ta", "en"],
    "articleSection": article.category,
    "description": article.excerpt_ta || article.excerpt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/news/${article.slug || article.id}`
    },
    "keywords": `மதுரை, Madurai, ${article.category}, செய்திகள், news, Tamil news`
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
        "name": "News",
        "item": `${baseUrl}/news`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": article.title,
        "item": `${baseUrl}/news/${article.slug || article.id}`
      }
    ]
  }

  // Organization schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "name": "Hello Madurai",
    "alternateName": "ஹலோ மதுரை",
    "url": baseUrl,
    "logo": `${baseUrl}/logo.jpg`,
    "sameAs": [
      "https://www.facebook.com/hellomaduraimedia/",
      "https://www.instagram.com/hello_madurai",
      "https://www.youtube.com/@hellomadurai",
      "https://x.com/hellomadurai?s=21"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Madurai",
      "addressRegion": "Tamil Nadu",
      "addressCountry": "IN"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "areaServed": "IN",
      "availableLanguage": ["Tamil", "English"]
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
    </>
  )
}
