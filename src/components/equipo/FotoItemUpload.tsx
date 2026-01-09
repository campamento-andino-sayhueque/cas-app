import React, { useState, useRef } from 'react';
import { Camera, Upload, Trash2, X, Check, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { useSubirFotoItem, useEliminarFotoItem } from '../../hooks/useEquipo';
import { equipoService } from '../../api/services/equipo';
import { toast } from 'sonner';

interface FotoItemUploadProps {
  itemId: number;
  itemName: string;
  hasFoto: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function FotoItemUpload({ itemId, itemName, hasFoto, onClose, onSuccess }: FotoItemUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(hasFoto ? equipoService.getThumbnailUrl(itemId) : null);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const { subirFoto } = useSubirFotoItem();
  const { eliminarFoto } = useEliminarFotoItem();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('La imagen no puede pesar más de 10MB');
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      await subirFoto({ itemId, file: selectedFile });
      toast.success('Foto subida con éxito');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error al subir foto:', error);
      toast.error('No se pudo subir la foto');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar la foto?')) return;

    try {
      setIsUploading(true);
      await eliminarFoto(itemId);
      toast.success('Foto eliminada');
      setPreviewUrl(null);
      setSelectedFile(null);
      onSuccess?.();
    } catch (error) {
      console.error('Error al eliminar foto:', error);
      toast.error('No se pudo eliminar la foto');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{itemName}</h3>
          <p className="text-sm text-gray-500">Subí una foto de tu equipo para que los dirigentes la revisen</p>
        </div>
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center group">
        {previewUrl ? (
          <>
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="h-full w-full object-contain"
              onLoad={() => {
                // If it's a blob url, we might want to revoke it later, but for now it's fine
              }}
            />
            {!isUploading && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleDelete}
                  className="h-9 w-9 p-0 rounded-full"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <ImageIcon className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900">Sin foto aún</p>
            <p className="text-xs text-gray-500 mt-1">Podés tomar una foto o seleccionar de tu galería</p>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            <p className="text-sm font-medium text-indigo-600">Procesando...</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          ref={cameraInputRef}
          onChange={handleFileChange}
        />
        <Button 
          variant="outline" 
          className="flex gap-2 h-12"
          onClick={() => cameraInputRef.current?.click()}
          disabled={isUploading}
        >
          <Camera className="h-4 w-4" />
          <span className="hidden sm:inline">Cámara</span>
          <span className="sm:hidden">Foto</span>
        </Button>

        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <Button 
          variant="outline" 
          className="flex gap-2 h-12"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">Galería</span>
          <span className="sm:hidden">Archivo</span>
        </Button>
      </div>

      {selectedFile && !isUploading && (
        <div className="flex gap-2 pt-2">
          <Button 
            className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700"
            onClick={handleUpload}
          >
            <Check className="h-4 w-4 mr-2" />
            Confirmar y Subir
          </Button>
          <Button 
            variant="ghost" 
            className="h-11"
            onClick={() => {
              setSelectedFile(null);
              setPreviewUrl(hasFoto ? equipoService.getThumbnailUrl(itemId) : null);
            }}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </div>
      )}

      <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Tip:</strong> Asegurate de que la foto esté bien iluminada y se vea claramente el item completo. Esto ayuda mucho a los dirigentes!
        </p>
      </div>
    </div>
  );
}
