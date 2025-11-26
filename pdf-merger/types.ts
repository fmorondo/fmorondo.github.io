
export interface PdfFile {
  id: string;
  file: File;
  name: string;
  thumbnailUrl: string | null;
}

export type ViewMode = 'list' | 'grid';
