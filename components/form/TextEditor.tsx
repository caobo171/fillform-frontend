'use client'
import React from 'react';
import clsx from 'clsx';

import './TextEditor.css';

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
    <></>
  );
}
