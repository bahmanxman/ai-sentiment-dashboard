import { useEffect, useState } from 'react';
import SentimentTrend from './components/SentimentTrend';
import SentimentDistribution from './components/SentimentDistribution';

function App() {
  const [stats, setStats] = useState<any>(null);
  const [latestData, setLatestData] = useState<any[]>([]);
  const [history, setHistory] = useState<number[]>([]);
  const [fullBatch, setFullBatch] = useState<any[]>([]);

  useEffect(() => {
    // Initialize the worker
    const worker = new Worker(
      new URL('./workers/sentiment.worker.ts', import.meta.url),
      {
        type: 'module',
      }
    );

    // Listen for the "crushed" data
    worker.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === 'DATA_UPDATE') {
        setStats(payload.stats);
        // We only keep the last batch in state to keep React fast
        setLatestData(payload.raw.slice(0, 10));
      }
    };

    return () => worker.terminate(); // Cleanup on unmount
  }, []);

  useEffect(() => {
    const worker = new Worker(
      new URL('./workers/sentiment.worker.ts', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = (e) => {
      const { payload } = e.data;
      setStats(payload.stats);
      setFullBatch(payload.raw); // For D3
      setHistory((prev) => [...prev.slice(-49), payload.stats.batchAvg]); // Keep last 50 for Chart.js
    };

    return () => worker.terminate();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 font-sans">
      <header className="flex justify-between items-center border-b border-slate-700 pb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            AI Sentiment Firehose
          </h1>
          <p className="text-slate-400 mt-1">
            Real-time processing via Web Workers
          </p>
        </div>

        {stats && (
          <div className="text-right">
            <div className="text-xs uppercase tracking-widest text-slate-500">
              Global Mood
            </div>
            <div
              className={`text-xl font-black ${stats.mood === 'HAPPY' ? 'text-green-400' : 'text-red-400'}`}
            >
              {stats.mood}
            </div>
          </div>
        )}
      </header>

      <main className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric Cards */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
          <h3 className="text-slate-400 text-sm font-medium">
            Items Processed
          </h3>
          <p className="text-4xl font-mono font-bold mt-2 text-blue-400">
            {stats?.totalProcessed.toLocaleString() || '0'}
          </p>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
          <h3 className="text-slate-400 text-sm font-medium">
            Batch Avg Sentiment
          </h3>
          <p className="text-4xl font-mono font-bold mt-2 text-emerald-400">
            {stats?.batchAvg || '0.00'}
          </p>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
          <h3 className="text-slate-400 text-sm font-medium">
            Global Running Avg
          </h3>
          <p className="text-4xl font-mono font-bold mt-2 text-purple-400">
            {stats?.globalAvg || '0.00'}
          </p>
        </div>
      </main>

      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">
          Live Sample Stream (Last Batch)
        </h2>
        <div className="space-y-2">
          {latestData.map((item: any) => (
            <div
              key={item.id}
              className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 flex justify-between"
            >
              <span>
                <span className="text-blue-400 font-bold">{item.u}:</span>{' '}
                {item.t}
              </span>
              <span
                className={`font-mono ${item.s > 0.5 ? 'text-green-400' : 'text-red-400'}`}
              >
                {item.s}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <h3 className="mb-4 text-slate-300 font-bold uppercase text-xs tracking-widest">
              Sentiment Trend (Chart.js)
            </h3>
            <SentimentTrend history={history} />
          </div>

          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <h3 className="mb-4 text-slate-300 font-bold uppercase text-xs tracking-widest">
              Density Distribution (D3)
            </h3>
            <SentimentDistribution data={fullBatch} />
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
