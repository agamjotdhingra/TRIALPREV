import { useListLabs } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, MapPin, Phone, Mail, FlaskConical } from "lucide-react";
import { useState } from "react";
import { VerificationBadge } from "../doctors/index";

export default function Labs() {
  const [search, setSearch] = useState("");
  const { data: labs, isLoading } = useListLabs({});

  const filteredLabs = labs?.filter(l => l.name.toLowerCase().includes(search.toLowerCase()) || l.registrationNumber.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lab Network</h1>
          <p className="text-muted-foreground mt-2">Manage connected diagnostic laboratories.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Laboratory
        </Button>
      </div>

      <div className="flex items-center gap-4 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search labs by name or ID..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading laboratories...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredLabs?.map((lab) => (
            <Card key={lab.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <FlaskConical className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg leading-tight">{lab.name}</CardTitle>
                      <CardDescription className="font-mono text-xs mt-1">ID: {lab.registrationNumber}</CardDescription>
                    </div>
                  </div>
                  <VerificationBadge status={lab.verificationStatus} />
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="space-y-2 text-sm">
                  {lab.address && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{lab.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>{lab.mobile}</span>
                  </div>
                  {lab.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span>{lab.email}</span>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Contact: {lab.contactPerson}</span>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredLabs?.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
              No laboratories match your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}