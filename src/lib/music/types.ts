export interface TransposeRequest {
  image: File;
  originalKey: string;
  targetKey: string;
}

export interface TransposeResponse {
  success: boolean;
  data?: {
    originalAbc: string;
    transposedAbc: string;
    originalKey: string;
    targetKey: string;
    semitoneShift: number;
    title?: string;
  };
  error?: string;
}
