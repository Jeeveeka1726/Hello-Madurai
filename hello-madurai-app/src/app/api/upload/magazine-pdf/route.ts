import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, mkdirSync, readdirSync, readFileSync, unlinkSync, rmdirSync, existsSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

// Final PDFs are stored in /public/uploads/magazines/ and served statically by Next.js
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'magazines')
// Chunks go to OS temp dir (writable on both Hostinger VPS and Vercel)
const TEMP_BASE = join(tmpdir(), 'pdf-chunks')

export async function POST(request: NextRequest) {
  try {
    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
    }

    const chunk = formData.get('chunk') as File | null
    const chunkIndex = parseInt((formData.get('chunkIndex') as string) ?? '-1')
    const totalChunks = parseInt((formData.get('totalChunks') as string) ?? '0')
    const rawFileId = (formData.get('fileId') as string) ?? ''
    const rawFilename = (formData.get('filename') as string) ?? ''

    const fileId = rawFileId.replace(/[^a-zA-Z0-9_-]/g, '')
    const filename = rawFilename.replace(/[^a-zA-Z0-9._-]/g, '_')

    if (!chunk || isNaN(chunkIndex) || totalChunks < 1 || !fileId || !filename) {
      return NextResponse.json({ error: 'Missing fields: chunk, chunkIndex, totalChunks, fileId, filename' }, { status: 400 })
    }

    // ── Save incoming chunk to temp dir ───────────────────────────────────────
    const sessionDir = join(TEMP_BASE, fileId)
    mkdirSync(sessionDir, { recursive: true })

    const chunkBuffer = Buffer.from(await chunk.arrayBuffer())
    const chunkPath = join(sessionDir, `chunk_${String(chunkIndex).padStart(5, '0')}`)
    writeFileSync(chunkPath, chunkBuffer)

    console.log(`📦 Saved chunk ${chunkIndex + 1}/${totalChunks} for ${fileId} (${chunkBuffer.length} bytes)`)

    // ── Check if all chunks have arrived ──────────────────────────────────────
    const received = readdirSync(sessionDir).filter(f => f.startsWith('chunk_'))

    if (received.length < totalChunks) {
      return NextResponse.json({
        success: false,
        received: received.length,
        total: totalChunks,
        message: 'Chunk saved, waiting for more',
      })
    }

    // ── All chunks received → assemble ────────────────────────────────────────
    console.log(`🔧 All ${totalChunks} chunks received, assembling PDF...`)

    const sortedChunks = received.sort()
    const buffers = sortedChunks.map(c => readFileSync(join(sessionDir, c)))
    const assembled = Buffer.concat(buffers)

    // Verify PDF magic bytes (%PDF-)
    if (assembled.slice(0, 5).toString('ascii') !== '%PDF-') {
      // Cleanup and reject
      sortedChunks.forEach(c => { try { unlinkSync(join(sessionDir, c)) } catch { } })
      try { rmdirSync(sessionDir) } catch { }
      return NextResponse.json({ error: 'Assembled file is not a valid PDF' }, { status: 400 })
    }

    // ── Save to public/uploads/magazines/ ─────────────────────────────────────
    mkdirSync(UPLOAD_DIR, { recursive: true })
    const finalFilename = `${Date.now()}_${filename}`
    const finalPath = join(UPLOAD_DIR, finalFilename)
    writeFileSync(finalPath, assembled)

    // Cleanup temp chunks
    sortedChunks.forEach(c => { try { unlinkSync(join(sessionDir, c)) } catch { } })
    try { rmdirSync(sessionDir) } catch { }

    // Build public URL — use request host so it works on both hellomadurai.com and vercel.app
    const host = request.headers.get('host') ?? 'hellomadurai.com'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const url = `${protocol}://${host}/uploads/magazines/${finalFilename}`

    console.log(`✅ PDF saved: ${url} (${Math.round(assembled.length / 1024)}KB)`)

    return NextResponse.json({
      success: true,
      url,
      filename: finalFilename,
      size: assembled.length,
    })
  } catch (error) {
    console.error('❌ Upload error:', error)
    return NextResponse.json({ error: 'Upload failed: ' + (error as Error).message }, { status: 500 })
  }
}
