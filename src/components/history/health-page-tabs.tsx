"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function HealthPageTabs({
  vitalContent,
  careContent,
}: {
  vitalContent: React.ReactNode;
  careContent: React.ReactNode;
}) {
  return (
    <Tabs defaultValue="vitalwerte" className="flex flex-col gap-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="vitalwerte">Vitalwerte</TabsTrigger>
        <TabsTrigger value="pflege">Pflege & Dokumente</TabsTrigger>
      </TabsList>
      <TabsContent value="vitalwerte" className="flex flex-col gap-6">
        {vitalContent}
      </TabsContent>
      <TabsContent value="pflege" className="flex flex-col gap-6">
        {careContent}
      </TabsContent>
    </Tabs>
  );
}
