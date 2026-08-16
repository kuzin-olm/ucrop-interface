/** Path to a file in `public/`, prefixed with Vite `base`. */
export function publicUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
}
