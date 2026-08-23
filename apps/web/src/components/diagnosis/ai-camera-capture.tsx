"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Camera,
  RefreshCw,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { ALLOWED_AI_IMAGE_MIME_TYPES, MAX_AI_IMAGE_SIZE_BYTES } from "@ioma/config";
import { Button } from "@/components/ui/button";

interface AiCameraCaptureProps {
  onPhotoSelected: (file: File) => void;
  isSubmitting?: boolean;
}

export function AiCameraCapture({ onPhotoSelected, isSubmitting }: AiCameraCaptureProps) {
  const t = useTranslations("Diagnosis.camera");
  const [mode, setMode] = useState<"instructions" | "camera" | "upload" | "preview">(
    "instructions",
  );
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("user");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async (facing: "user" | "environment" = cameraFacing) => {
    setErrorMessage(null);
    stopCamera();
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setMode("camera");
    } catch {
      setErrorMessage(t("cameraError"));
      setMode("upload");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const switchCamera = () => {
    const nextFacing = cameraFacing === "user" ? "environment" : "user";
    setCameraFacing(nextFacing);
    startCamera(nextFacing);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (cameraFacing === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `ioma-skin-capture-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        const url = URL.createObjectURL(blob);
        setSelectedFile(file);
        setPreviewUrl(url);
        stopCamera();
        setMode("preview");
      },
      "image/jpeg",
      0.92,
    );
  };

  const handleFileChange = (file: File | null) => {
    setErrorMessage(null);
    if (!file) return;

    if (!(ALLOWED_AI_IMAGE_MIME_TYPES as readonly string[]).includes(file.type)) {
      setErrorMessage(t("invalidType"));
      return;
    }
    if (file.size > MAX_AI_IMAGE_SIZE_BYTES) {
      setErrorMessage(t("tooLarge"));
      return;
    }

    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(url);
    setMode("preview");
  };

  const retake = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setSelectedFile(null);
    setErrorMessage(null);
    setMode("instructions");
  };

  const confirmPhoto = () => {
    if (selectedFile) {
      onPhotoSelected(selectedFile);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      {/* 1. Photography Instructions */}
      {mode === "instructions" && (
        <div className="border border-border bg-card p-6 md:p-8 text-center animate-in fade-in duration-300">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {t("stepLabel")}
          </p>
          <h2 className="mt-2 font-display text-2xl md:text-3xl">
            {t("instructionsTitle")}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            {t("instructionsSubtitle")}
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div className="flex items-start gap-2.5 p-3 rounded-md bg-accent/40 border border-border/40 text-xs">
              <CheckCircle2 className="size-4 shrink-0 text-foreground mt-0.5" />
              <span>{t("guideDirectFace")}</span>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-md bg-accent/40 border border-border/40 text-xs">
              <CheckCircle2 className="size-4 shrink-0 text-foreground mt-0.5" />
              <span>{t("guideNaturalLight")}</span>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-md bg-accent/40 border border-border/40 text-xs">
              <CheckCircle2 className="size-4 shrink-0 text-foreground mt-0.5" />
              <span>{t("guideNoFilters")}</span>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-md bg-accent/40 border border-border/40 text-xs">
              <CheckCircle2 className="size-4 shrink-0 text-foreground mt-0.5" />
              <span>{t("guideNeutralExpression")}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              className="w-full sm:w-auto uppercase tracking-widest px-8"
              onClick={() => startCamera("user")}
              data-testid="start-camera-button"
            >
              <Camera className="me-2 size-4" />
              {t("openCameraButton")}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto uppercase tracking-widest"
              onClick={() => setMode("upload")}
            >
              <Upload className="me-2 size-4" />
              {t("uploadInsteadButton")}
            </Button>
          </div>
        </div>
      )}

      {/* 2. Live Camera View */}
      {mode === "camera" && (
        <div className="relative border border-border bg-black overflow-hidden rounded-lg">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={() => videoRef.current?.play()}
            className={`w-full aspect-3/4 object-cover ${cameraFacing === "user" ? "scale-x-[-1]" : ""}`}
          />

          {/* Oval face positioning guide */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
            <div className="w-[68%] aspect-[3/4] rounded-[50%] border-2 border-dashed border-white/60 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]" />
            <p className="absolute bottom-20 text-xs uppercase tracking-widest text-white/90 bg-black/60 px-4 py-1.5 rounded-full backdrop-blur-sm">
              {t("positionFaceInstruction")}
            </p>
          </div>

          {/* Camera controls */}
          <div className="absolute bottom-4 inset-x-0 flex items-center justify-between px-6">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full size-11 bg-white/20 text-white hover:bg-white/40 backdrop-blur-md"
              onClick={switchCamera}
              title={t("switchCamera")}
            >
              <RefreshCw className="size-5" />
            </Button>

            <button
              type="button"
              className="size-16 rounded-full border-4 border-white bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
              onClick={capturePhoto}
              data-testid="capture-photo-button"
              aria-label={t("takePhoto")}
            >
              <div className="size-12 rounded-full bg-foreground" />
            </button>

            <Button
              variant="secondary"
              size="sm"
              className="rounded-full text-xs bg-white/20 text-white hover:bg-white/40 backdrop-blur-md"
              onClick={() => {
                stopCamera();
                setMode("upload");
              }}
            >
              {t("uploadPhoto")}
            </Button>
          </div>
        </div>
      )}

      {/* 3. Upload File Fallback */}
      {mode === "upload" && (
        <div className="border border-border bg-card p-8 text-center animate-in fade-in duration-300">
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_AI_IMAGE_MIME_TYPES.join(",")}
            className="sr-only"
            data-testid="ai-file-input"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />

          <div
            className="border-2 border-dashed border-border/80 hover:border-foreground/60 p-10 cursor-pointer transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mx-auto size-10 text-muted-foreground stroke-1" />
            <p className="mt-4 font-display text-lg">{t("dropOrBrowseTitle")}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("uploadSpecifications")}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-6 uppercase tracking-widest"
            >
              {t("selectFileButton")}
            </Button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => startCamera("user")}>
              <Camera className="me-2 size-4" />
              {t("useCameraInstead")}
            </Button>
          </div>

          {errorMessage && (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-destructive">
              <AlertCircle className="size-4" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      )}

      {/* 4. Photo Preview & Confirmation */}
      {mode === "preview" && previewUrl && (
        <div className="border border-border bg-card p-6 md:p-8 text-center animate-in fade-in duration-300">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {t("previewKicker")}
          </p>
          <h2 className="mt-2 font-display text-2xl">{t("confirmPhotoTitle")}</h2>

          <div className="mt-6 relative mx-auto w-64 aspect-3/4 overflow-hidden rounded-md border border-border shadow-md">
            <img
              src={previewUrl}
              alt="Skin capture preview"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto uppercase tracking-widest"
              onClick={retake}
              disabled={isSubmitting}
            >
              {t("retakeButton")}
            </Button>
            <Button
              size="lg"
              className="w-full sm:w-auto uppercase tracking-widest px-8"
              onClick={confirmPhoto}
              disabled={isSubmitting}
              data-testid="use-photo-button"
            >
              <Sparkles className="me-2 size-4" />
              {isSubmitting ? t("analyzingButton") : t("analyzePhotoButton")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
