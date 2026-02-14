/// <reference types="vinxi/types/client" />

interface ImportMetaEnv {
  DB_URL: string;
  DB_MIGRATIONS_URL: string;
  SITE_NAME: string;
  SESSION_SECRET: string;
  NOTION_CLIENT_ID: string;
  NOTION_CLIENT_SECRET: string;
  NOTION_REDIRECT_URI: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
