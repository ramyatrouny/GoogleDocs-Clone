import { useCallback, useState } from "react";
import Quill from "quill";
import { useParams } from "react-router";
import { useSocket } from "@/hooks/useSocket";
import { useDocumentSync } from "@/hooks/useDocumentSync";
import "quill/dist/quill.snow.css";

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["link"],
  ["clean"],
];

export function TextEditor() {
  const { id: documentId } = useParams<"id">();
  const socket = useSocket();
  const [quill, setQuill] = useState<Quill | null>(null);

  useDocumentSync(socket, quill, documentId!);

  const editorRef = useCallback((wrapper: HTMLDivElement | null) => {
    if (!wrapper) return;

    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);

    const q = new Quill(editor, {
      theme: "snow",
      modules: { toolbar: TOOLBAR_OPTIONS },
    });

    q.disable();
    q.setText("Loading...");
    setQuill(q);
  }, []);

  return <div className="container" ref={editorRef} />;
}
