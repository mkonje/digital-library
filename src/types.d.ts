// src/types.d.ts

declare global {
  interface Response {
    json(): Promise<any>;
  }
}

export {};
