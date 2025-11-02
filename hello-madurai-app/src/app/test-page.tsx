'use client'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold mb-8">Color Test Page</h1>
      
      {/* Test 1: Inline style with white */}
      <div className="bg-blue-600 p-6 mb-4" style={{ color: 'white' }}>
        <h2 className="text-xl font-bold">Test 1: Inline style color: white</h2>
        <p>This text should be white</p>
      </div>

      {/* Test 2: Inline style with #ffffff */}
      <div className="bg-blue-600 p-6 mb-4" style={{ color: '#ffffff' }}>
        <h2 className="text-xl font-bold">Test 2: Inline style color: #ffffff</h2>
        <p>This text should be white</p>
      </div>

      {/* Test 3: Tailwind text-white class */}
      <div className="bg-blue-600 p-6 mb-4 text-white">
        <h2 className="text-xl font-bold">Test 3: Tailwind text-white class</h2>
        <p>This text should be white</p>
      </div>

      {/* Test 4: Nested elements */}
      <div className="bg-blue-600 p-6 mb-4" style={{ color: 'white' }}>
        <h2 className="text-xl font-bold" style={{ color: 'white' }}>Test 4: Nested with inline styles</h2>
        <p style={{ color: 'white' }}>This text should be white</p>
        <span style={{ color: 'white' }}>This span should be white</span>
      </div>

      {/* Test 5: Link wrapper */}
      <a href="#" className="block">
        <div className="bg-blue-600 p-6 mb-4" style={{ color: 'white' }}>
          <h2 className="text-xl font-bold" style={{ color: 'white' }}>Test 5: Inside Link wrapper</h2>
          <p style={{ color: 'white' }}>This text should be white</p>
        </div>
      </a>
    </div>
  )
}

