import "dotenv/config";
import { defineConfig, env } from '@prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
  generator: {
    output: process.env.NODE_ENV === 'production' 
      ? './node_modules/.prisma/client' 
      : './src/generated/prisma'
  }
});