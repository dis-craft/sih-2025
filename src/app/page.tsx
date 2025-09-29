import { Header } from '@/components/layout/header';
import { SearchTrains } from '@/components/dashboard/search-trains';
import { DelayPredictionCard } from '@/components/dashboard/delay-prediction';
import { LiveStatusCard } from '@/components/dashboard/live-status';
import { MyRoutesCard } from '@/components/dashboard/my-routes';

export default function DashboardPage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-background">
      <Header title="Dashboard" />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="grid gap-6 md:gap-8 grid-cols-1 xl:grid-cols-3">
          <div className="xl:col-span-2 grid gap-6 md:gap-8">
            <SearchTrains />
            <DelayPredictionCard />
          </div>
          <div className="space-y-6 md:space-y-8">
            <LiveStatusCard />
            <MyRoutesCard />
          </div>
        </div>
      </main>
    </div>
  );
}
