'use client';
import { simulationCases } from '@/lib/simulation-cases';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '../ui/sidebar';
import { BookCopy, Check } from 'lucide-react';

export function CaseSelector({ sectionId }: { sectionId: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentCase = searchParams.get('case') || 'case1';

    const handleCaseChange = (caseId: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('case', caseId);
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Simulation Cases</SidebarGroupLabel>
            <SidebarMenu>
                {Object.values(simulationCases).map(c => (
                    <SidebarMenuItem key={c.id}>
                        <SidebarMenuButton onClick={() => handleCaseChange(c.id)} isActive={currentCase === c.id} tooltip={c.name}>
                            <BookCopy />
                            <span>{c.name}</span>
                            {currentCase === c.id && <Check className='ml-auto'/>}
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
