import LineChart from '@/components/charts/LineChart';
import { Card } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      {/* <h1 className="text-2xl font-bold mb-4">Welcome to Legasys</h1> */}
      <Card className="p-6">
        <LineChart />
      </Card>
    </div>
  );
}
