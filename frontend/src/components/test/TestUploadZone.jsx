import React, { useRef, useState } from "react";
import { Upload, X, FileVideo } from "lucide-react";

const MAX_MB = 80;

export default function TestUploadZone({ file, uploadId, uploading, uploadProgress, onPickFile, onUpload, onClear, error }) {
  const fileRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) onPickFile(f);
  };

  return (
    <div className="p-6 lg:p-8 border border-neutral-900 bg-[#0f0f0f] rounded-sm">
      <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-3">Upload your draft *</label>
      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          data-testid="test-dropzone"
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-sm py-12 cursor-pointer transition-colors ${
            dragOver ? "border-yellow-500 bg-yellow-500/5" : "border-neutral-800 hover:border-neutral-600 bg-neutral-900/40"
          }`}
        >
          <Upload size={28} className="text-neutral-500 mb-3" strokeWidth={1.5} />
          <div className="text-sm text-neutral-300">Drop your video here, or <span className="text-yellow-500 underline">browse</span></div>
          <div className="text-xs text-neutral-500 mt-2">MP4, MOV, WebM · up to {MAX_MB}MB · 8-180 seconds</div>
          <input
            ref={fileRef} type="file" accept="video/*"
            onChange={(e) => onPickFile(e.target.files?.[0])}
            data-testid="test-file-input"
            className="hidden"
          />
        </div>
      ) : (
        <SelectedFileCard
          file={file}
          uploadId={uploadId}
          uploading={uploading}
          uploadProgress={uploadProgress}
          onUpload={onUpload}
          onClear={onClear}
        />
      )}
      {error && <div className="text-sm text-red-400 mt-3" data-testid="test-upload-error">{error}</div>}
    </div>
  );
}

function SelectedFileCard({ file, uploadId, uploading, uploadProgress, onUpload, onClear }) {
  return (
    <div className="border border-neutral-800 rounded-sm p-4" data-testid="test-file-card">
      <div className="flex items-start gap-3">
        <FileVideo size={28} className="text-yellow-500 mt-1" strokeWidth={1.5} />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate" data-testid="test-file-name">{file.name}</div>
          <div className="text-xs text-neutral-500 mt-1">{(file.size / (1024 * 1024)).toFixed(1)} MB</div>
          {uploading && (
            <div className="mt-3">
              <div className="h-1 bg-neutral-900 rounded-sm overflow-hidden">
                <div className="h-full bg-yellow-500 transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
              <div className="text-xs text-neutral-500 mt-1">{uploadProgress}% uploaded</div>
            </div>
          )}
          {uploadId && (
            <div className="mt-2 inline-flex items-center gap-1 text-xs text-green-400" data-testid="test-upload-success">
              ✓ Uploaded &amp; ready
            </div>
          )}
        </div>
        <button type="button" onClick={onClear} data-testid="test-file-clear" className="text-neutral-500 hover:text-white">
          <X size={18} />
        </button>
      </div>
      {!uploadId && !uploading && (
        <button
          type="button" onClick={onUpload}
          data-testid="test-upload-btn"
          className="mt-4 inline-flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-sm text-sm"
        >
          <Upload size={14} /> Upload to start
        </button>
      )}
    </div>
  );
}

export { MAX_MB };
