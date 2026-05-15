import { YoutubeTranscript } from 'youtube-transcript';

async function test() {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    console.log("Success! Characters fetched:", JSON.stringify(transcript).length);
    console.log("Preview:", transcript.slice(0, 3));
  } catch(e) {
    console.error("Failed:", e);
  }
}

test();
