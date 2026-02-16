// src/pages/events/create/steps/MediaStep.tsx
import React from "react";

type MediaStepProps = {
  bannerImageUrl?: string;
  setBannerImageUrl: (v?: string) => void;
  mediaUrls: string[];
  setMediaUrls: (v: string[]) => void;
  uploadingBanner: boolean;
  uploadingGallery: boolean;
  handleBannerChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleGalleryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeGalleryImage: (url: string) => void;
};

export const MediaStep: React.FC<MediaStepProps> = ({
  bannerImageUrl,
  setBannerImageUrl,
  mediaUrls,
  setMediaUrls,
  uploadingBanner,
  uploadingGallery,
  handleBannerChange,
  handleGalleryChange,
  removeGalleryImage,
}) => {
  return (
    <div className="space-y-4 sm:space-y-5">
      <div>
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
          Event Media
        </h2>
        <p className="text-xs sm:text-sm text-gray-500">
          Add images for your event (optional).
        </p>
      </div>

      {/* Banner */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 space-y-2 sm:space-y-3">
        <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
          Banner image (hero)
          <span className="ml-1 text-[11px] sm:text-xs font-normal text-gray-400">
            Optional, shown at top of event page
          </span>
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white text-xs sm:text-sm rounded-lg font-semibold hover:bg-indigo-700 transition"
            onClick={() =>
              document.getElementById("banner-input")?.click()
            }
          >
            Choose File
          </button>
          <span className="text-xs sm:text-sm text-gray-600">
            {bannerImageUrl ? "1 file selected" : "No file chosen"}
          </span>
        </div>

        <input
          id="banner-input"
          type="file"
          accept="image/*"
          onChange={handleBannerChange}
          className="hidden"
        />

        {uploadingBanner && (
          <p className="text-[11px] sm:text-xs text-gray-500 mt-1">
            Uploading banner...
          </p>
        )}

        {bannerImageUrl && (
          <div className="mt-2">
            <p className="text-[11px] sm:text-xs text-gray-500 mb-1">
              Banner preview (tap to remove)
            </p>
            <img
              src={bannerImageUrl}
              alt="Banner preview"
              className="w-full h-40 sm:h-48 object-cover rounded-lg border border-gray-200 cursor-pointer"
              onClick={() => setBannerImageUrl(undefined)}
            />
          </div>
        )}
      </div>

      {/* Gallery */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 space-y-2 sm:space-y-3">
        <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
          Gallery images
          <span className="ml-1 text-[11px] sm:text-xs font-normal text-gray-400">
            Optional, shown in event gallery
          </span>
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white text-xs sm:text-sm rounded-lg font-semibold hover:bg-indigo-700 transition"
            onClick={() =>
              document.getElementById("gallery-input")?.click()
            }
          >
            Choose Files
          </button>
          <span className="text-xs sm:text-sm text-gray-600">
            {mediaUrls.length > 0
              ? `${mediaUrls.length} file${
                  mediaUrls.length > 1 ? "s" : ""
                } selected`
              : "No file chosen"}
          </span>
        </div>

        <input
          id="gallery-input"
          type="file"
          accept="image/*"
          multiple
          onChange={handleGalleryChange}
          className="hidden"
        />

        {uploadingGallery && (
          <p className="text-[11px] sm:text-xs text-gray-500 mt-1">
            Uploading gallery images...
          </p>
        )}

        {mediaUrls.length > 0 && (
          <div className="mt-3">
            <p className="text-[11px] sm:text-xs text-gray-500 mb-2">
              Gallery preview
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {mediaUrls.map((url) => (
                <div key={url} className="relative group">
                  <img
                    src={url}
                    alt="Gallery"
                    className="w-full h-16 sm:h-20 md:h-24 object-cover rounded-md border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(url)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 text-[10px] sm:text-xs opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
