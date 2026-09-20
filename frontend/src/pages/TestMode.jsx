import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Target, Loader2 } from "lucide-react";
import api from "../lib/api";
import TestUploadZone, { MAX_MB } from "../components/test/TestUploadZone";
import TestMetadataForm from "../components/test/TestMetadataForm";

function useFileUpload(setTitleIfEmpty) {
  const [file, setFile] = useState(null);
  const [uploadId, setUploadId] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const pickFile = (f) => {
    setUploadError("");
    if (!f) return;
    if (!f.type.startsWith("video/")) {
      setUploadError("Please upload a video file (mp4, mov, webm).");
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setUploadError(`Video too large (max ${MAX_MB}MB).`);
      return;
    }
    setFile(f);
    setUploadId("");
    setTitleIfEmpty(f.name.replace(/\.[^.]+$/, ""));
  };

  const upload = async () => {
    if (!file) return;
    setUploading(true); setUploadError(""); setUploadProgress(0);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const { data } = await api.post("/uploads", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
      setUploadId(data.id);
    } catch (e) {
      setUploadError(e?.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const clear = () => {
    setFile(null); setUploadId(""); setUploadProgress(0); setUploadError("");
  };

  return { file, uploadId, uploadProgress, uploading, uploadError, pickFile, upload, clear };
}

export default function TestMode({ embedded = false, platform = "tiktok" } = {}) {
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(30);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const setTitleIfEmpty = (t) => setTitle((prev) => prev || t);
  const upload = useFileUpload(setTitleIfEmpty);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitError(""); setSubmitting(true);
    try {
      const { data } = await api.post("/analyze", {
        mode: "test",
        upload_id: upload.uploadId || undefined,
        title: title.trim() || upload.file?.name || "Untitled draft",
        description: description.trim() || (upload.uploadId ? "User-uploaded draft video." : "Draft notes only."),
        duration_sec: parseInt(duration, 10) || 30,
        platform: platform || "tiktok",
      });
      nav(`/app/analysis/${data.id}`);
    } catch (e2) {
      setSubmitError(e2?.response?.data?.detail || "Failed to start analysis");
    } finally {
      setSubmitting(false);
    }
  };

  const submitDisabled = submitting || (upload.file && !upload.uploadId);

  return (
    <div className="px-5 lg:px-10 py-8 lg:py-12 max-w-4xl mx-auto" data-testid="test-page">
      <div className="mb-10">
        {!embedded && <div className="text-xs uppercase tracking-widest text-yellow-500 mb-2">Test Mode</div>}
        {embedded && <div className="text-xs uppercase tracking-widest text-yellow-500 mb-2">Test · {platform}</div>}
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Test your draft before you post.</h1>
        <p className="text-neutral-400 mt-3 max-w-2xl">
          Upload the actual video file — we&apos;ll watch it frame-by-frame and score it 0-100 against viral outliers in your niche,
          flag the Good / Bad / Ugly, and give you timestamped fixes.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-5" data-testid="test-form">
        <TestUploadZone
          file={upload.file}
          uploadId={upload.uploadId}
          uploading={upload.uploading}
          uploadProgress={upload.uploadProgress}
          onPickFile={upload.pickFile}
          onUpload={upload.upload}
          onClear={upload.clear}
          error={upload.uploadError}
        />
        <TestMetadataForm
          title={title} setTitle={setTitle}
          duration={duration} setDuration={setDuration}
          description={description} setDescription={setDescription}
        />
        {submitError && <div className="text-sm text-red-400" data-testid="test-error">{submitError}</div>}
        <button
          type="submit" disabled={submitDisabled}
          data-testid="test-submit-btn"
          className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-medium px-6 py-3 rounded-sm disabled:opacity-50"
          title={submitDisabled && upload.file && !upload.uploadId ? "Click 'Upload to start' first" : ""}
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Target size={16} />}
          {submitting ? "Starting test…" : "Score my draft"}
        </button>
        {upload.file && !upload.uploadId && !upload.uploading && (
          <p className="text-xs text-neutral-500" data-testid="test-upload-hint">Upload the file before running the test.</p>
        )}
      </form>
    </div>
  );
}
