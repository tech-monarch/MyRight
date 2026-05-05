import { useRef } from "react";

export const FileUploadInput = ({
  onUpload,
}: {
  onUpload: (files: File[]) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="mt-2">
      <input
        type="file"
        multiple
        ref={inputRef}
        onChange={(e) => {
          if (e.target.files) {
            onUpload(Array.from(e.target.files));
          }
        }}
        className="border p-1 rounded"
      />
      <button
        onClick={() => inputRef.current?.click()}
        className="ml-2 bg-(--color-primary-navy) text-white px-3 py-1 rounded"
      >
        Select Files
      </button>
    </div>
  );
};
