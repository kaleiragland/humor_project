'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic'];
const API_BASE = 'https://api.almostcrackd.ai';

type Caption = {
  id: string;
  content: string;
  [key: string]: unknown;
};

type Step = 'idle' | 'presign' | 'upload' | 'register' | 'captions' | 'done' | 'error';

const STEP_LABELS: Record<Step, string> = {
  idle: '',
  presign: 'Step 1/4: Generating upload URL...',
  upload: 'Step 2/4: Uploading image...',
  register: 'Step 3/4: Registering image...',
  captions: 'Step 4/4: Generating captions...',
  done: 'Done!',
  error: 'Something went wrong.',
};

export default function ImageUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('idle');
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setErrorMsg('Unsupported file type. Please use JPEG, PNG, WebP, GIF, or HEIC.');
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setCaptions([]);
    setUploadedImageUrl(null);
    setErrorMsg('');
    setStep('idle');
  };

  const handleUpload = async () => {
    if (!file) return;

    setErrorMsg('');
    setCaptions([]);

    // Get JWT from Supabase session
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) {
      setErrorMsg('Not authenticated. Please sign in again.');
      return;
    }

    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    try {
      // Step 1: Get presigned URL
      setStep('presign');
      const presignRes = await fetch(`${API_BASE}/pipeline/generate-presigned-url`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ contentType: file.type }),
      });
      if (!presignRes.ok) throw new Error(`Presign failed: ${presignRes.statusText}`);
      const { presignedUrl, cdnUrl } = await presignRes.json();

      // Step 2: Upload to S3
      setStep('upload');
      const uploadRes = await fetch(presignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error(`Upload failed: ${uploadRes.statusText}`);
      setUploadedImageUrl(cdnUrl);

      // Step 3: Register image
      setStep('register');
      const registerRes = await fetch(`${API_BASE}/pipeline/upload-image-from-url`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse: false }),
      });
      if (!registerRes.ok) throw new Error(`Register failed: ${registerRes.statusText}`);
      const { imageId } = await registerRes.json();

      // Step 4: Generate captions
      setStep('captions');
      const captionRes = await fetch(`${API_BASE}/pipeline/generate-captions`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ imageId }),
      });
      if (!captionRes.ok) throw new Error(`Caption generation failed: ${captionRes.statusText}`);
      const captionData = await captionRes.json();

      setCaptions(Array.isArray(captionData) ? captionData : []);
      setStep('done');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error');
      setStep('error');
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setCaptions([]);
    setUploadedImageUrl(null);
    setErrorMsg('');
    setStep('idle');
    if (inputRef.current) inputRef.current.value = '';
  };

  const isLoading = !['idle', 'done', 'error'].includes(step);

  return (
    <div className="space-y-6">
      {/* File picker */}
      <div
        className="border-2 border-dashed border-purple-300 rounded-2xl p-8 text-center cursor-pointer hover:border-purple-500 transition bg-purple-50/50"
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleFileChange}
          className="hidden"
        />
        {preview ? (
          <div className="relative w-full h-56 rounded-xl overflow-hidden">
            <Image src={preview} alt="Preview" fill className="object-contain" unoptimized />
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-4xl">📸</p>
            <p className="text-sm font-semibold text-purple-700">Click to select an image</p>
            <p className="text-xs text-zinc-500">JPEG, PNG, WebP, GIF, HEIC</p>
          </div>
        )}
      </div>

      {file && (
        <p className="text-sm text-zinc-600 text-center">
          Selected: <span className="font-semibold">{file.name}</span> ({(file.size / 1024).toFixed(1)} KB)
        </p>
      )}

      {/* Buttons */}
      <div className="flex gap-3 justify-center">
        {file && !isLoading && step !== 'done' && (
          <button
            onClick={handleUpload}
            className="rounded-full bg-purple-500 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-600 transition shadow-lg"
          >
            Upload & Generate Captions
          </button>
        )}
        {(file || step === 'done') && !isLoading && (
          <button
            onClick={handleReset}
            className="rounded-full bg-gray-200 px-6 py-3 text-sm font-semibold text-zinc-700 hover:bg-gray-300 transition shadow"
          >
            Reset
          </button>
        )}
      </div>

      {/* Progress */}
      {isLoading && (
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-purple-400 border-t-transparent" />
          </div>
          <p className="text-sm font-semibold text-purple-700">{STEP_LABELS[step]}</p>
        </div>
      )}

      {/* Error */}
      {step === 'error' && errorMsg && (
        <div className="rounded-xl bg-red-100 p-4 text-center text-sm text-red-700 font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Results */}
      {step === 'done' && (
        <div className="space-y-4">
          {uploadedImageUrl && (
            <div className="relative w-full h-56 rounded-xl overflow-hidden bg-gray-100">
              <Image src={uploadedImageUrl} alt="Uploaded image" fill className="object-contain" unoptimized />
            </div>
          )}

          <h2 className="text-lg font-bold text-zinc-800 text-center">
            Generated Captions
          </h2>

          {captions.length === 0 ? (
            <p className="text-center text-zinc-500 text-sm">No captions were returned.</p>
          ) : (
            <ul className="space-y-3">
              {captions.map((cap, i) => (
                <li
                  key={cap.id ?? i}
                  className="rounded-2xl bg-purple-50 border border-purple-200 px-5 py-4 text-zinc-800 text-sm leading-relaxed"
                >
                  <span className="font-semibold text-purple-600 mr-2">{i + 1}.</span>
                  {String(cap.content ?? cap.caption ?? JSON.stringify(cap))}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
