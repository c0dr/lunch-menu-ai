export interface Config {
  database: {
    url: string;
  };
  api: {
    baseUrl: string;
  };
  cron: {
    schedule: string;
  };
  confluence: {
    baseUrl: string;
    auth: string;
    pageId: string;
  };
  openai: {
    apiKey: string;
    model: string;
  };
}

export const config: Config = {
  database: {
    url: process.env.DATABASE_URL!,
  },
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL!,
  },
  cron: {
    schedule: "0 6 * * 1-5", // 6 AM weekdays
  },
  confluence: {
    baseUrl: process.env.CONFLUENCE_BASE_URL!,
    auth: process.env.CONFLUENCE_AUTH!,
    pageId: process.env.CONFLUENCE_PAGE_ID!,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY!,
    model: process.env.OPENAI_MODEL || "gemini-2.0-flash",
  },
};