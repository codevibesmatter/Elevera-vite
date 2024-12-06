import { useUser } from "@clerk/clerk-react";
import { useState } from "react";
import { Upload, X } from "lucide-react";

export default function AvatarUpload() {
  const { user } = useUser();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      // Create a FormData instance
      const formData = new FormData();
      formData.append("file", file);

      // Upload to Clerk
      const uploadResponse = await user?.setProfileImage({
        file,
      });

      if (!uploadResponse) {
        throw new Error("Failed to upload image");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await user?.setProfileImage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove avatar");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="avatar">
        <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
          <img
            src={user?.imageUrl || "/default-avatar.png"}
            alt={user?.firstName || "Profile"}
          />
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <X className="w-4 h-4" />
          <span>{error}</span>
          <button className="btn btn-ghost btn-xs" onClick={() => setError("")}>
            Dismiss
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <label className={`btn btn-outline ${isUploading ? "loading" : ""}`}>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <Upload className="w-4 h-4 mr-2" />
          {isUploading ? "Uploading..." : "Upload Avatar"}
        </label>

        {user?.imageUrl && (
          <button
            className="btn btn-ghost"
            onClick={handleRemoveAvatar}
            disabled={isUploading}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
