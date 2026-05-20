import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
);

export default function SentimentTrend({ history }: { history: number[] }) {
  const data = {
    labels: history.map((_, i) => i),
    datasets: [
      {
        label: 'Avg Sentiment',
        data: history,
        fill: true,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: { min: 0, max: 1, grid: { color: '#334155' } },
      x: { display: false },
    },
    animation: { duration: 0 },
  };

  return <Line data={data} options={options} />;
}
