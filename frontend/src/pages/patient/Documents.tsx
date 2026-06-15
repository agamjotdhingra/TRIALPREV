import { useState } from "react";
import { useListDocuments, useCreateDocument, useGetPatientMe } from "@/api/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/api/supabase";
import { del } from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Upload, Trash2, Download, Loader2, Shield, FolderOpen } from "lucide-react";

const DOCUMENT_CATEGORIES = [
  "Medical ID Card",
  "Insurance",
  "Prior Prescription",
  "Discharge Summary",
  "Lab Result",
  "Radiology / Scan",
  "Vaccination Record",
  "Other",
];

export default function PatientDocuments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: patient } = useGetPatientMe();
  const { data: documents, isLoading } = useListDocuments();
  const createDocumentMutation = useCreateDocument();

  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Custom local delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => del(`/documents/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast({
        title: "Document deleted",
        description: "The document has been removed from your profile.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Delete failed",
        description: err.message || "Could not delete document.",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !category) {
      toast({
        title: "Missing fields",
        description: "Please select a file and a category.",
        variant: "destructive",
      });
      return;
    }

    if (!patient?.id) {
      toast({
        title: "Error",
        description: "Patient profile not loaded.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const randomId = Math.random().toString(36).substring(2, 10);
      const storageFileName = `${Date.now()}_${randomId}.${fileExt}`;
      const storageFilePath = `${patient.id}/${storageFileName}`;

      // 1. Upload to Supabase Storage documents bucket
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(storageFilePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // 2. Create document record via Express backend
      await createDocumentMutation.mutateAsync({
        fileName: file.name,
        fileUrl: storageFilePath,
        category,
        mimeType: file.type,
      });

      toast({
        title: "Document uploaded",
        description: `"${file.name}" uploaded successfully.`,
      });

      // Clear state
      setFile(null);
      setCategory("");
      // Reset input element
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err.message || "Failed to upload file.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      if (fileUrl.startsWith("http")) {
        window.open(fileUrl, "_blank");
        return;
      }

      // Generate signed URL for private bucket
      const { data, error } = await supabase.storage
        .from("documents")
        .createSignedUrl(fileUrl, 60);

      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank");
      }
    } catch (err: any) {
      toast({
        title: "Download failed",
        description: err.message || "Could not retrieve access link.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400">Loading documents...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <FolderOpen className="h-8 w-8 text-blue-500" />
          My Documents
        </h1>
        <p className="text-slate-400 mt-2">
          Securely upload and store your personal health credentials, prescriptions, ID cards, or insurance policies.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form */}
        <div className="lg:col-span-1">
          <Card className="bg-slate-900 border-slate-800 text-white sticky top-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-400" /> Upload File
              </CardTitle>
              <CardDescription className="text-slate-400">
                Uploaded files are stored securely in a private bucket.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-slate-350">Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 text-white focus:ring-slate-700">
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-white">
                      {DOCUMENT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat} className="focus:bg-slate-850 hover:bg-slate-850">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file-upload" className="text-slate-350">File *</Label>
                  <div className="border border-dashed border-slate-800 rounded-lg p-6 bg-slate-950 hover:bg-slate-900 transition flex flex-col items-center justify-center text-center cursor-pointer relative">
                    <input
                      id="file-upload"
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="h-8 w-8 text-slate-500 mb-2" />
                    <p className="text-sm font-medium text-slate-300">
                      {file ? file.name : "Click to select a file"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      PDF, DOC, DOCX, JPEG, PNG (max 10MB)
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isUploading || !file || !category}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white border-none gap-2 font-semibold"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" /> Upload Document
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Documents Table */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader>
              <CardTitle className="text-white">Uploaded Health Documents</CardTitle>
              <CardDescription className="text-slate-400">
                You have {documents?.length || 0} secure files stored.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table className="text-slate-350">
                <TableHeader className="bg-slate-950/40">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">File Name</TableHead>
                    <TableHead className="text-slate-400">Category</TableHead>
                    <TableHead className="text-slate-400">Uploaded At</TableHead>
                    <TableHead className="text-slate-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents?.map((doc) => (
                    <TableRow key={doc.id} className="border-slate-800 hover:bg-slate-850/40">
                      <TableCell className="max-w-[240px] truncate">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                          <span className="font-medium text-white">{doc.file_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{doc.category}</TableCell>
                      <TableCell className="text-xs font-mono">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(doc.file_url, doc.file_name)}
                          className="text-blue-400 hover:text-white hover:bg-slate-800"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={deleteMutation.isPending}
                          onClick={() => deleteMutation.mutate(doc.id)}
                          className="text-red-400 hover:text-white hover:bg-red-950/40"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!documents || documents.length === 0) && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={4} className="h-32 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2 py-4">
                          <Shield className="h-8 w-8 text-slate-600" />
                          <p>No documents uploaded yet.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
