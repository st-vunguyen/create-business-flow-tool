declare module "mammoth" {
  export function extractRawText(input: { path: string }): Promise<{ value: string }>;
}

declare module "pdf-parse" {
  export default function pdfParse(input: Buffer): Promise<{ text: string }>;
}
