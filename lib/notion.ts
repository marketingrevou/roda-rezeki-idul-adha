import { Client } from "@notionhq/client";

let cachedClient: Client | null = null;

function getNotionClient() {
  if (cachedClient) return cachedClient;
  if (!process.env.NOTION_API_KEY) {
    throw new Error("Missing NOTION_API_KEY in environment");
  }
  cachedClient = new Client({ auth: process.env.NOTION_API_KEY });
  return cachedClient;
}

export async function appendToNotion(email: string, result: string) {
  const notion = getNotionClient();
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!databaseId) {
    throw new Error("Missing NOTION_DATABASE_ID in environment");
  }

  await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      email: {
        title: [{ text: { content: email } }],
      },
      result: {
        rich_text: [{ text: { content: result } }],
      },
      time: {
        date: { start: new Date().toISOString() },
      },
    },
  });
}
