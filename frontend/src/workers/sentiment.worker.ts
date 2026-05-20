// src/workers/sentiment.worker.ts

// We use an Interface for the data coming from our "Moody" Backend
interface RawData {
  id: string;
  u: string; // user
  t: string; // text
  s: number; // sentiment
  ts: number; // timestamp
}

interface BackendResponse {
  mood: string;
  count: number;
  data: RawData[];
}

// Internal state of the worker
let totalProcessed = 0;
let runningSentimentSum = 0;
let rollingBuffer: RawData[] = [];
const MAX_BUFFER_SIZE = 5000;

// This is the "Brain" that runs on a separate thread
const pollData = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/sentiment/stream');
    const { mood, data }: BackendResponse = await response.json();

    // Add new data and trim the old data (FIFO - First In, First Out)
    rollingBuffer = [...rollingBuffer, ...data].slice(-MAX_BUFFER_SIZE);

    // 1. Heavy lifting: Calculate aggregates
    const batchCount = data.length;
    const batchSum = data.reduce((acc, item) => acc + item.s, 0);
    const batchAvg = batchSum / batchCount;

    // 2. Update global stats
    totalProcessed += batchCount;
    runningSentimentSum += batchSum;
    const globalAvg = runningSentimentSum / totalProcessed;

    // 3. Send the "crushed" data back to the main thread
    // We send the raw data for the charts, but also the pre-calculated stats
    postMessage({
      type: 'DATA_UPDATE',
      payload: {
        raw: rollingBuffer,
        stats: {
          mood,
          batchAvg: parseFloat(batchAvg.toFixed(2)),
          globalAvg: parseFloat(globalAvg.toFixed(2)),
          totalProcessed,
        },
      },
    });
  } catch (error) {
    postMessage({ type: 'ERROR', message: 'Failed to fetch from firehose' });
  }
};

// Start polling every 1 second
setInterval(pollData, 1000);
