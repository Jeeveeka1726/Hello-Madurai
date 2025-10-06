// Test YouTube URL extraction
const testUrls = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://youtu.be/dQw4w9WgXcQ',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=share',
  'dQw4w9WgXcQ' // Just the ID
];

function extractYouTubeId(url) {
  if (!url) return null;
  
  // If it's already just the ID (11 characters)
  if (url.length === 11 && !url.includes('/') && !url.includes('?')) {
    return url;
  }
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

console.log('Testing YouTube URL extraction:\n');
testUrls.forEach(url => {
  const id = extractYouTubeId(url);
  console.log(`URL: ${url}`);
  console.log(`Extracted ID: ${id}`);
  console.log(`ReactPlayer URL: https://www.youtube.com/watch?v=${id}`);
  console.log('---');
});

