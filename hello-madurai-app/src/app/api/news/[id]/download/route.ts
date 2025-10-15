import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import jsPDF from 'jspdf'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: newsId } = await params

    // Fetch article from Hostinger MySQL
    const article = await prisma.news.findUnique({
      where: { id: newsId }
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    if (!article.allowDownload) {
      return NextResponse.json(
        { error: 'Download not allowed for this article' },
        { status: 403 }
      )
    }

    // Create PDF
    const pdf = new jsPDF()
    
    // Add title
    pdf.setFontSize(20)
    pdf.text(article.title, 20, 30)
    
    // Add author and date
    pdf.setFontSize(12)
    pdf.text(`By: ${article.author}`, 20, 50)
    pdf.text(`Published: ${new Date(article.publishedAt).toLocaleDateString()}`, 20, 60)
    
    // Add content (simplified - in production you'd want better text wrapping)
    pdf.setFontSize(11)
    const lines = pdf.splitTextToSize(article.content.replace(/<[^>]*>/g, ''), 170)
    pdf.text(lines, 20, 80)

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${article.title}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
