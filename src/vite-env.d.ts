/// <reference types="vite/client" />

declare module "virtual:load-fonts.jsx" {
  export const LoadFonts: React.FC;
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  // add more env variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly hot?: {
    readonly data: any;
    accept(): void;
    dispose(cb: (data: any) => void): void;
    accept(dep: string, callback: (mod: any) => void): void;
    on(event: string, cb: Function): void;
    off(event: string, cb: Function): void;
  };
}