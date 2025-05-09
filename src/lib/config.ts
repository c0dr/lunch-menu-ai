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
};