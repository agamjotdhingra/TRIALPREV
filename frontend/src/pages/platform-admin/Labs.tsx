import { useListLabs } from "@/api/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Phone, Mail, FlaskConical } from "lucide-react";
import { useState } from "react";
import { VerificationBadge } from "./Doctors";

export default function AdminLabs() {
  const [search, setSearch] = useState("");
  const { data: labs, isLoading } = useListLabs();

  const filteredLabs = labs?.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.registration_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Lab Network</h1>
          <p className="text-slate-400 mt-2">Manage connected diagnostic laboratories.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search labs by name or ID..."
            className="pl-9 bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-slate-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400">Loading laboratories...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredLabs?.map((lab) => (
            <Card key={lab.id} className="flex flex-col bg-slate-900 border-slate-800 text-white">
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                      <FlaskConical className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg leading-tight text-white font-semibold">{lab.name}</CardTitle>
                      <CardDescription className="font-mono text-xs mt-1 text-slate-400">ID: {lab.registration_number}</CardDescription>
                    </div>
                  </div>
                  <VerificationBadge status={lab.verification_status} />
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4 flex flex-col justify-between">
                <div className="space-y-2 text-sm text-slate-350">
                  {lab.address && (
                    <div className="flex items-start gap-2 text-slate-400">
                      <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-slate-400" />
                      <span>{lab.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-400">
                    <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                    <span>{lab.mobile}</span>
                  </div>
                  {lab.email && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                      <span>{lab.email}</span>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 mt-4">
                  <span>Contact: {lab.contact_person}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredLabs?.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 bg-slate-900/50 rounded-lg border border-dashed border-slate-800">
              No laboratories match your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
