'use client'
import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import clsx from 'clsx';

import './TextEditor.css';
import { ReactQuillNoSSR } from './NoSSR';

type TextEditorProps = {
  className?: string;
  disabled?: boolean;
};

const modules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [
      { list: 'ordered' },
      { list: 'bullet' },
      { indent: '-1' },
      { indent: '+1' },
    ],
  ],
};

const formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  'bullet',
  'indent',
];

export function TextEditor(props: TextEditorProps) {
  const { className, ...rest } = props;

  return (
    <ReactQuillNoSSR
      className={clsx('text-editor pb-[42px]', className)}
      modules={modules}
      formats={formats}
      theme="snow"
      {...rest}
    />
  );
}
