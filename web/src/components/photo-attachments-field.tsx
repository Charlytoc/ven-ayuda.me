"use client";

import { useEffect, useRef, useState } from "react";
import {
  ActionIcon,
  Box,
  Button,
  FileButton,
  Group,
  Image,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import { IconPhoto, IconX } from "@tabler/icons-react";

type PhotoItem = {
  id: string;
  file: File;
  previewUrl: string;
};

type PhotoAttachmentsFieldProps = {
  photos: PhotoItem[];
  onChange: (photos: PhotoItem[]) => void;
};

function createPhotoItem(file: File): PhotoItem {
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
    file,
    previewUrl: URL.createObjectURL(file),
  };
}

export function PhotoAttachmentsField({
  photos,
  onChange,
}: PhotoAttachmentsFieldProps) {
  function addFiles(files: File[] | null) {
    if (!files?.length) {
      return;
    }
    onChange([...photos, ...files.map(createPhotoItem)]);
  }

  function removePhoto(id: string) {
    const removed = photos.find((photo) => photo.id === id);
    if (removed) {
      URL.revokeObjectURL(removed.previewUrl);
    }
    onChange(photos.filter((photo) => photo.id !== id));
  }

  return (
    <Stack gap="xs">
      <Text size="sm" fw={500}>
        Fotos (opcional)
      </Text>
      <FileButton
        onChange={addFiles}
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
      >
        {(props) => (
          <Button {...props} variant="default" leftSection={<IconPhoto size={16} />}>
            Adjuntar fotos
          </Button>
        )}
      </FileButton>
      {photos.length > 0 ? (
        <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="sm">
          {photos.map((photo) => (
            <Box
              key={photo.id}
              style={{
                position: "relative",
                borderRadius: 8,
                overflow: "hidden",
                border: "1px solid var(--mantine-color-dark-4)",
              }}
            >
              <Image
                src={photo.previewUrl}
                alt={photo.file.name}
                h={100}
                fit="cover"
              />
              <ActionIcon
                variant="filled"
                color="dark"
                size="sm"
                aria-label="Eliminar foto"
                onClick={() => removePhoto(photo.id)}
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                }}
              >
                <IconX size={14} />
              </ActionIcon>
            </Box>
          ))}
        </SimpleGrid>
      ) : null}
    </Stack>
  );
}

export function usePhotoAttachments() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const photosRef = useRef(photos);
  photosRef.current = photos;

  useEffect(() => {
    return () => {
      for (const photo of photosRef.current) {
        URL.revokeObjectURL(photo.previewUrl);
      }
    };
  }, []);

  function clearPhotos() {
    for (const photo of photos) {
      URL.revokeObjectURL(photo.previewUrl);
    }
    setPhotos([]);
  }

  return { photos, setPhotos, clearPhotos };
}

export type { PhotoItem };
