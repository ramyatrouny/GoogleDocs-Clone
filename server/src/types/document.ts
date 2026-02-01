export interface DeltaOp {
  insert?: string | Record<string, unknown>;
  delete?: number;
  retain?: number;
  attributes?: Record<string, unknown>;
}

export interface Delta {
  ops?: DeltaOp[];
}
