db = db.getSiblingDB("google-docs-clone");

db.documents.insertMany([
  {
    _id: "welcome",
    data: {
      ops: [
        {
          insert: "Welcome to Google Docs Clone",
          attributes: { bold: true, size: "huge" },
        },
        { insert: "\n\n" },
        {
          insert:
            "This is a real-time collaborative document editor. Open this same URL in another browser tab and start typing to see changes appear instantly.",
        },
        { insert: "\n\n" },
        { insert: "Features", attributes: { bold: true } },
        { insert: "\n" },
        { insert: "Real-time collaboration via WebSockets", attributes: { list: "bullet" } },
        { insert: "\n" },
        { insert: "Rich text formatting with Quill editor", attributes: { list: "bullet" } },
        { insert: "\n" },
        { insert: "Auto-save every 2 seconds", attributes: { list: "bullet" } },
        { insert: "\n" },
        { insert: "Shareable document URLs", attributes: { list: "bullet" } },
        { insert: "\n\n" },
        {
          insert:
            "Try editing this document or visit the root URL to create a fresh one.",
        },
        { insert: "\n" },
      ],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "getting-started",
    data: {
      ops: [
        {
          insert: "Getting Started Guide",
          attributes: { bold: true, size: "huge" },
        },
        { insert: "\n\n" },
        { insert: "How It Works", attributes: { bold: true } },
        { insert: "\n\n" },
        {
          insert:
            "Each document has a unique ID in the URL. Anyone with the same URL can collaborate in real-time. Changes are broadcast to all connected clients through Socket.IO and automatically persisted to MongoDB.",
        },
        { insert: "\n\n" },
        { insert: "Keyboard Shortcuts", attributes: { bold: true } },
        { insert: "\n" },
        { insert: "Ctrl/Cmd + B", attributes: { bold: true, code: true } },
        { insert: " Bold" },
        { insert: "\n" },
        { insert: "Ctrl/Cmd + I", attributes: { bold: true, code: true } },
        { insert: " Italic" },
        { insert: "\n" },
        { insert: "Ctrl/Cmd + U", attributes: { bold: true, code: true } },
        { insert: " Underline" },
        { insert: "\n" },
      ],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);

print("Seeded 2 documents: 'welcome' and 'getting-started'");
