import { Header } from "@/components/layout/header";
import { sections, simulations, events } from "@/lib/data";
import { notFound } from "next/navigation";
import { TimeControl } from "@/components/simulation/time-control";
import { KPIPanel } from "@/components/simulation/kpi-panel";
import { RequestQueue } from "@/components/simulation/request-queue";
import { EventLog } from "@/components/simulation/event-log";
import { MapComponent } from "@/components/simulation/map-component";

export default function SimulationPage({ params }: { params: { sectionId: string } }) {
    const sectionId = params.sectionId.toUpperCase().replace('-', '_');
    const section = Object.values(sections).find(s => s.id.toUpperCase().replace('-', '_') === sectionId);
    
    if (!section) {
        notFound();
    }
    
    const simulation = Object.values(simulations).find(s => s.sectionId === section.id);

    if (!simulation) {
        notFound();
    }

    return (
        <div className="flex flex-col h-screen bg-background">
            <Header sectionName={section.name} />
            <main className="flex-1 flex flex-col md:grid md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 overflow-hidden">
                <div className="md:col-span-2 lg:col-span-3 flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <TimeControl simStatus={simulation.status} />
                        <KPIPanel metrics={simulation.metrics} />
                    </div>
                    <div className="flex-1 min-h-[300px] md:min-h-0">
                       <MapComponent section={section}/>
                    </div>
                </div>
                <div className="md:col-span-1 lg:col-span-1 flex flex-col gap-4 h-full overflow-y-auto">
                    <RequestQueue sectionId={section.id}/>
                    <EventLog events={events} />
                </div>
            </main>
        </div>
    );
}
