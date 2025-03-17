import clsx from 'clsx';
import React, { useEffect, useMemo, useState } from 'react';
import { Accept, FileWithPath, useDropzone } from 'react-dropzone';

import Constants from '@/core/Constants';

type FileUploaderProps = {
  className?: string;
  accept?: Accept;
  icon?: React.ReactNode;
  onChange?: (value: File[]) => void;
  value?: File[] | string[];
};

type FileWithPathAndPreview = {
  preview: string;
} & FileWithPath;

export function FileUploader(props: FileUploaderProps) {
  const {
    className,
    accept = {
      'image/*': [],
    },
    icon,
    onChange,
    value,
    ...rest
  } = props;

  const [files, setFiles] = useState<FileWithPathAndPreview[]>([]);

  const [fileUrls, setFileUrls] = useState<string[]>([]);

  const { getRootProps, getInputProps } = useDropzone({
    accept,
    onDrop: (acceptedFiles) => {
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )
      );

      if (onChange) {
        onChange(acceptedFiles);
      }
    },
  });

  const existedThumbs = useMemo(
    () =>
      fileUrls.map((file) => (
        <div
          className="inline-flex p-1 rounded border border-solid border-gray-200 bg-white"
          key={file}
        >
          <img
            src={Constants.IMAGE_URL + file}
            className="h-[100px] w-auto"
            alt={file}
          />
        </div>
      )),
    [fileUrls]
  );

  const existedPlayers = useMemo(
    () =>
      fileUrls.map((file) => (
        <div
          className="inline-flex p-1 rounded border border-solid border-gray-200 bg-white w-full"
          key={file}
        >
          <audio controls className="w-full">
            <source src={Constants.IMAGE_URL + file} />
          </audio>
        </div>
      )),
    [fileUrls]
  );

  const thumbs = useMemo(
    () =>
      files.filter(e => e).map((file) => (
        <div
          className="inline-flex p-1 rounded border border-solid border-gray-200 bg-white"
          key={file.name}
        >
          <img
            src={file.preview}
            className="h-[100px] w-auto"
            alt={file.name}
            // Revoke data uri after image is loaded
            onLoad={() => {
              URL.revokeObjectURL(file.preview);
            }}
          />
        </div>
      )),
    [files]
  );

  const players = useMemo(
    () =>
      files.filter(e => e).map((file) => (
        <div
          className="inline-flex p-1 rounded border border-solid border-gray-200 bg-white w-full"
          key={file.name}
        >
          <audio controls className="w-full">
            <source
              src={file.preview}
              // Revoke data uri after image is loaded
              onLoad={() => {
                URL.revokeObjectURL(file.preview);
              }}
            />
          </audio>
        </div>
      )),
    [files]
  );

  const preview = useMemo(() => {
    const keys = Object.keys(accept);

    if (keys.includes('image/*')) {
      if (files.length) {
        return thumbs;
      }

      return existedThumbs;
    }

    if (keys.includes('audio/*')) {
      if (files.length) {
        return players;
      }

      return existedPlayers;
    }

    return null;
  }, [accept, thumbs, players, existedThumbs, existedPlayers, files.length]);

  useEffect(
    () =>
      // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
      () =>
        files.forEach((file) => URL.revokeObjectURL(file.preview)),
    []
  );

  useEffect(() => {
    if (Array.isArray(value)) {
      if (typeof value[0] === 'string') {
        setFileUrls(value as string[]);
      } else {
        setFiles(value as FileWithPathAndPreview[]);
      }
    }
  }, [value]);

  return (
    <div className={clsx('flex flex-col gap-2', className)}>
      <div
        {...getRootProps({ className: 'dropzone' })}
        className={clsx(
          'h-28 flex flex-col items-center justify-center gap-2 border border-dashed border-gray-400 rounded bg-white'
        )}
      >
        <input {...getInputProps()} {...rest} />
        {icon}
        <p className="text-sm text-gray-500">
          Drag & drop, or click to select files
        </p>
      </div>

      {preview && preview?.length > 0 && (
        <div className="flex flex-wrap gap-2">{preview}</div>
      )}
    </div>
  );
}
