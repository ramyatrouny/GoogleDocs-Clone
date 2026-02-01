import { Schema, model } from "mongoose";
import type { Delta } from "../types/index.js";

interface IDocument {
  _id: string;
  data: Delta;
}

const documentSchema = new Schema<IDocument>(
  {
    _id: { type: String, required: true },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export const Document = model<IDocument>("Document", documentSchema);
