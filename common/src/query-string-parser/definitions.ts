export type Segment = {
  selector: string | null;
  text: string;
  regex: boolean;
}

export const REGEX_CHAR = '/';
export const QUOTE_CHARS: string[] = ['"', REGEX_CHAR];
export const ESCAPE_CHAR = '\\';
