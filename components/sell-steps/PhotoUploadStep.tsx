'use client'

import { useCallback } from 'react'
import Image from 'next/image'
import { useDropzone } from 'react-dropzone'
import imageCompression from 'browser-image-compression'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Camera, Trash2, Upload } from 'lucide-react'

interface SortableImageProps {
  id: string
  preview: string
  index: number
  onRemove: (index: number) => void
}

function SortableImage({ id, preview, index, onRemove }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-move"
      >
        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
          <Image
            src={preview}
            alt={`画像 ${index + 1}`}
            fill
            className="object-cover"
          />
          {index === 0 && (
            <div className="absolute top-2 left-2 bg-pink-600 text-white text-xs px-2 py-1 rounded">
              メイン画像
            </div>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}

interface PhotoUploadStepProps {
  images: File[]
  previews: string[]
  updateFormData: (updates: any) => void
  error: string
  setError: (error: string) => void
}

export default function PhotoUploadStep({ 
  images, 
  previews, 
  updateFormData, 
  error, 
  setError 
}: PhotoUploadStepProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const compressImage = useCallback(async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 2,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    }
    
    try {
      const compressedFile = await imageCompression(file, options)
      return compressedFile
    } catch (error) {
      console.error('画像圧縮エラー:', error)
      return file
    }
  }, [])

  const processImages = useCallback(async (files: File[]) => {
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    const validImages: File[] = [];
    const newPreviews: string[] = [];
    const errors: string[] = [];
    
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`${file.name}は対応していない形式です`);
        continue;
      }
      
      if (file.size > MAX_FILE_SIZE) {
        const compressedFile = await compressImage(file);
        if (compressedFile.size > MAX_FILE_SIZE) {
          errors.push(`${file.name}のサイズが大きすぎます`);
          continue;
        }
        validImages.push(compressedFile);
      } else {
        if (file.size > 2 * 1024 * 1024) {
          const compressedFile = await compressImage(file);
          validImages.push(compressedFile);
        } else {
          validImages.push(file);
        }
      }
      
      const preview = URL.createObjectURL(validImages[validImages.length - 1]);
      newPreviews.push(preview);
    }
    
    if (errors.length > 0) {
      setError(errors.join('、'));
      setTimeout(() => setError(''), 5000);
    }
    
    return { validImages, newPreviews };
  }, [compressImage, setError])

  const handleFiles = useCallback(async (files: File[]) => {
    if (files.length + images.length > 10) {
      setError('画像は最大10枚までアップロードできます')
      return
    }

    const { validImages, newPreviews } = await processImages(files)
    
    if (validImages.length > 0) {
      updateFormData({
        images: [...images, ...validImages],
        previews: [...previews, ...newPreviews]
      })
    }
  }, [images, previews, processImages, updateFormData, setError])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    await handleFiles(acceptedFiles)
  }, [handleFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 10 - images.length,
    disabled: images.length >= 10
  })

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = images.findIndex((_, index) => `image-${index}` === active.id)
      const newIndex = images.findIndex((_, index) => `image-${index}` === over?.id)
      
      updateFormData({
        images: arrayMove(images, oldIndex, newIndex),
        previews: arrayMove(previews, oldIndex, newIndex)
      })
    }
  }

  const removeImage = (index: number) => {
    updateFormData({
      images: images.filter((_, i) => i !== index),
      previews: previews.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Camera className="mx-auto h-12 w-12 text-pink-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          ドレスの写真をアップロード
        </h3>
        <p className="text-gray-600">
          美しい写真は購入者の関心を引きます。最大10枚まで登録できます。
        </p>
      </div>

      {images.length === 0 ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ${
            isDragActive 
              ? 'border-pink-500 bg-pink-50 scale-[1.02]' 
              : 'border-gray-300 hover:border-pink-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <p className="text-lg text-gray-600 mb-2">
            {isDragActive ? '画像をドロップしてください' : 'クリックまたはドラッグ&ドロップで画像を追加'}
          </p>
          <p className="text-sm text-gray-500">
            JPEG、PNG、WebP形式（最大10MB）
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={images.map((_, index) => `image-${index}`)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {previews.map((preview, index) => (
                  <SortableImage
                    key={`image-${index}`}
                    id={`image-${index}`}
                    preview={preview}
                    index={index}
                    onRemove={removeImage}
                  />
                ))}
                
                {images.length < 10 && (
                  <div
                    {...getRootProps()}
                    className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-pink-400 transition-colors bg-gray-50 hover:bg-gray-100"
                  >
                    <input {...getInputProps()} />
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">追加</p>
                    </div>
                  </div>
                )}
              </div>
            </SortableContext>
          </DndContext>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Camera className="w-4 h-4" strokeWidth={2} />
              撮影のコツ
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 自然光の下で撮影すると色が美しく写ります</li>
              <li>• 全体、上半身、スカート部分など様々な角度から</li>
              <li>• ドラッグして画像の順番を変更できます（最初がメイン画像）</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}