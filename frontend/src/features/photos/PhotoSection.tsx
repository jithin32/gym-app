import { useEffect, useRef, useState } from 'react';
import { Camera, Trash2, Upload, X } from 'lucide-react';
import { photosApi } from '../../services/api';

interface Photo {
  id: number;
  image_url: string;
  notes: string | null;
  uploaded_at: string;
}

interface Props {
  memberId: number;
  canDelete?: boolean;
}

export default function PhotoSection({ memberId, canDelete = true }: Props) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<Photo | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    photosApi.list(memberId)
      .then((r) => setPhotos(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [memberId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('photo', file);
    setUploading(true);
    try {
      await photosApi.upload(memberId, fd);
      load();
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    await photosApi.delete(id);
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    if (preview?.id === id) setPreview(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Progress Photos</h3>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition"
        >
          <Upload className="w-3.5 h-3.5" />
          {uploading ? 'Uploading…' : 'Upload Photo'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>

      {loading ? (
        <div className="text-center py-6 text-gray-400 text-sm">Loading photos...</div>
      ) : photos.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
          <Camera className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">No progress photos yet</p>
          <p className="text-gray-300 text-xs mt-1">Upload photos to track your visual progress</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((p) => (
            <div key={p.id} className="relative group aspect-square">
              <img
                src={p.image_url}
                alt="progress"
                className="w-full h-full object-cover rounded-lg cursor-pointer"
                onClick={() => setPreview(p)}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-lg transition" />
              <p className="absolute bottom-1 left-1 right-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition text-center truncate">
                {new Date(p.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </p>
              {canDelete && (
                <button
                  onClick={() => handleDelete(p.id)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div className="relative max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreview(null)}
              className="absolute -top-8 right-0 text-white hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={preview.image_url} alt="preview" className="w-full rounded-xl" />
            <div className="mt-2 flex items-center justify-between">
              <p className="text-white text-sm">
                {new Date(preview.uploaded_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
              {canDelete && (
                <button
                  onClick={() => handleDelete(preview.id)}
                  className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-sm"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              )}
            </div>
            {preview.notes && <p className="text-gray-400 text-sm mt-1">{preview.notes}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
