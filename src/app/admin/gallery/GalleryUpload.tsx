"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Upload, X, Check, Loader2, Image as ImageIcon } from "lucide-react";
import { addGalleryItem } from "@/app/actions/gallery";
import { useRouter } from "next/navigation";

export default function GalleryUpload({ events }: { events: any[] }) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ [key: string]: number }>({});
  const [selectedEventId, setSelectedEventId] = useState("");
  const supabase = createClient();
  const router = useRouter();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;
    setUploading(true);

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `items/${fileName}`;

      // 1. Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('gallery')
        .upload(filePath, file, {
          onUploadProgress: (p) => {
            setProgress(prev => ({ ...prev, [file.name]: (p.loaded / p.total) * 100 }));
          }
        });

      if (error) {
        console.error("Upload error:", error);
        continue;
      }

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath);

      // 3. Add to Database
      const formData = new FormData();
      formData.append("title", file.name.split('.')[0]); // Use filename as default title
      formData.append("imageUrl", publicUrl);
      formData.append("eventId", selectedEventId);
      
      await addGalleryItem(formData);
    }

    setUploading(false);
    setFiles([]);
    setProgress({});
    router.refresh();
  };

  return (
    <div className="bg-neutral-900 border border-white/5 p-8 rounded-[2rem] space-y-6">
      <h2 className="text-xl font-black uppercase tracking-tight flex items-center">
        <Upload className="w-5 h-5 mr-2 text-yellow-500" />
        Upload par Batch
      </h2>

      <div className="space-y-4">
        <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500">Événement parent (Optionnel)</label>
        <select 
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-yellow-500 transition-all text-sm appearance-none"
        >
          <option value="">Sélectionner un événement</option>
          {events?.map(e => (
            <option key={e.id} value={e.id}>{e.title}</option>
          ))}
        </select>
      </div>

      <div 
        className={`relative border-2 border-dashed rounded-[2rem] p-10 text-center transition-all ${files.length > 0 ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-white/5 hover:border-white/20'}`}
      >
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-neutral-800 rounded-2xl flex items-center justify-center mb-4">
            <ImageIcon className="w-8 h-8 text-neutral-500" />
          </div>
          <p className="text-sm font-bold text-white mb-1">
            {files.length > 0 ? `${files.length} fichiers sélectionnés` : 'Glissez vos photos ici'}
          </p>
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-black">Ou cliquez pour parcourir</p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
          {files.map((file) => (
            <div key={file.name} className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5">
              <span className="text-[10px] font-medium text-neutral-400 truncate max-w-[200px]">{file.name}</span>
              {uploading && progress[file.name] !== undefined && (
                <div className="flex items-center space-x-2">
                  <div className="w-20 h-1 bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 transition-all" style={{ width: `${progress[file.name]}%` }} />
                  </div>
                  {progress[file.name] === 100 ? <Check className="w-3 h-3 text-green-500" /> : <Loader2 className="w-3 h-3 text-yellow-500 animate-spin" />}
                </div>
              )}
              {!uploading && (
                <button onClick={() => setFiles(files.filter(f => f !== file))} className="text-red-500">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <button 
        onClick={uploadFiles}
        disabled={files.length === 0 || uploading}
        className="w-full bg-yellow-500 text-black font-black py-4 rounded-2xl uppercase tracking-widest text-xs hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Upload en cours...</span>
          </>
        ) : (
          <span>Publier {files.length} photos</span>
        )}
      </button>
    </div>
  );
}
