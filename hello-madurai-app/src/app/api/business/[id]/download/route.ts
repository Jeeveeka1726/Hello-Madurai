import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jsPDF from 'jspdf'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const businessId = parseInt(id)

    const business = await prisma.business.findUnique({
      where: { id: businessId }
    })

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    // Create PDF
    const pdf = new jsPDF()
    
    // Add business name
    pdf.setFontSize(20)
    pdf.text(business.name, 20, 30)
    
    // Add category
    pdf.setFontSize(14)
    pdf.text(`Category: ${business.category}`, 20, 50)
    
    // Add description
    if (business.description) {
      pdf.setFontSize(12)
      const descLines = pdf.splitTextToSize(business.description, 170)
      pdf.text(descLines, 20, 70)
    }
    
    // Add contact info
    pdf.setFontSize(11)
    let yPos = business.description ? 70 + 20 : 70
    
    pdf.text('Contact Information:', 20, yPos)
    yPos += 10
    pdf.text(`Address: ${business.address}`, 20, yPos)
    yPos += 10
    pdf.text(`Phone: ${business.phone}`, 20, yPos)
    
    if (business.email) {
      yPos += 10
      pdf.text(`Email: ${business.email}`, 20, yPos)
    }
    
    if (business.website) {
      yPos += 10
      pdf.text(`Website: ${business.website}`, 20, yPos)
    }

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${business.name}-info.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating business PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
