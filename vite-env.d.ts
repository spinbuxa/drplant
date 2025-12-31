// Reference to vite/client is commented out to avoid "Cannot find type definition file" error
// /// <reference types="vite/client" />

// Augment the global NodeJS namespace to strictly type process.env.API_KEY.
// This works with existing @types/node definitions and avoids "Cannot redeclare block-scoped variable 'process'" error.
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    [key: string]: string | undefined;
  }
}
