import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { TextEditor } from "@/components/TextEditor";

function generateId(): string {
  return crypto.randomUUID();
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={`/documents/${generateId()}`} replace />}
        />
        <Route path="/documents/:id" element={<TextEditor />} />
      </Routes>
    </BrowserRouter>
  );
}
