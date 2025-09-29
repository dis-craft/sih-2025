import { Header } from "@/components/layout/header";
import { sections, events } from "@/lib/data";
import { notFound } from "next/navigation";
import { RequestQueue } from "@/components/simulation/request-queue";
import { EventLog } from "@/components/simulation/event-log";
import { SimulationView } from "@/components/simulation/simulation-view";
import { SidebarProvider, Sidebar, SidebarInset, SidebarContent, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";
import { CaseSelector } from "@/components/simulation/case-selector";
import { Button } from "@/components/ui/button";
import { Bot, Settings } from "lucide-react";
import { AICopilot } from "@/components/simulation/ai-copilot";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { KPIPanel } from "@/components/simulation/kpi-panel";
import { useSimulation } from "@/hooks/use-simulation";

export default function SimulationPage({ params, searchParams }: { 
    params: { sectionId: string },
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const sectionId = params.sectionId.toUpperCase().replace('-', '_');
    const section = Object.values(sections).find(s => s.id.toUpperCase().replace('-', '_') === sectionId);
    
    if (!section) {
        notFound();
    }
    
    const caseId = typeof searchParams.case === 'string' ? searchParams.case : 'case1';
    
    return (
        <SidebarProvider>
            <div className="flex flex-col h-screen bg-background text-foreground">
                <Header sectionName={section.name} />
                <div className="flex flex-1 overflow-hidden">
                    <Sidebar>
                        <SidebarHeader>
                            <h2 className="text-xl font-semibold">Simulations</h2>
                        </SidebarHeader>
                        <SidebarContent className="p-2">
                           <CaseSelector sectionId={section.id} />
                        </SidebarContent>
                        <SidebarFooter>
                             <Button variant="ghost">
                                <Settings />
                                Settings
                            </Button>
                        </SidebarFooter>
                    </Sidebar>
                    <SidebarInset>
                        <main className="flex-1 flex flex-col md:grid md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 overflow-hidden">
                            <SimulationView section={section} caseId={caseId} />
                            <div className="md:col-span-1 lg:col-span-1 flex flex-col gap-4 h-full">
                                <AICopilot />
                                <Tabs defaultValue="kpis" className="flex-1 flex flex-col min-h-0">
                                  <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="kpis">Live KPIs</TabsTrigger>
                                    <TabsTrigger value="requests">Queue</TabsTrigger>
                                    <TabsTrigger value="audit">Audit</TabsTrigger>
                                  </TabsList>
                                   <TabsContent value="kpis" className="flex-1 min-h-0">
                                    <KPIPanel caseId={caseId} />
                                  </TabsContent>
                                  <TabsContent value="requests" className="flex-1 min-h-0">
                                    <Card className='h-full flex flex-col'>
                                      <RequestQueue sectionId={section.id}/>
                                    </Card>
                                  </TabsContent>
                                  <TabsContent value="audit" className="flex-1 min-h-0">
                                    <EventLog events={events} />
                                  </TabsContent>
                                </Tabs>
                            </div>
                        </main>
                    </SidebarInset>
                </div>
            </div>
        </SidebarProvider>
    );
}
