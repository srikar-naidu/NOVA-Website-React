import { Client } from '@notionhq/client';

const getNotionClient = () => {
  return new Client({
    auth: process.env.NOTION_API_KEY,
  });
};

export const getProjects = async (filters) => {
  const notion = getNotionClient();
  const dbId = process.env.PROJECT_SHOWCASE_DB_ID;
  
  const filter = {
    and: [
      { property: 'IsPublic', checkbox: { equals: true } }
    ]
  };

  if (filters.eventId) {
    filter.and.push({ property: 'EventId', rich_text: { contains: filters.eventId } });
  }

  if (filters.tags) {
    const tagList = filters.tags.split(',').map(t => t.trim());
    tagList.forEach(tag => {
      filter.and.push({ property: 'Tags', multi_select: { contains: tag } });
    });
  }

  const response = await notion.databases.query({
    database_id: dbId,
    filter,
    sorts: [{ timestamp: 'created_time', direction: 'descending' }]
  });

  return response.results.map(page => {
    let members = [];
    try {
      const membersRaw = page.properties.Members?.rich_text[0]?.plain_text;
      if (membersRaw) members = JSON.parse(membersRaw);
    } catch (e) {
      console.error('Failed to parse members for project', page.id);
    }

    let screenshots = [];
    const screenshotsRaw = page.properties.Screenshots?.rich_text[0]?.plain_text;
    if (screenshotsRaw) {
      screenshots = screenshotsRaw.split(',').map(s => s.trim());
    }

    return {
      _id: page.id,
      title: page.properties.Title?.title[0]?.plain_text || '',
      description: page.properties.Description?.rich_text[0]?.plain_text || '',
      eventId: page.properties.EventId?.rich_text[0]?.plain_text || '',
      eventName: page.properties.EventName?.rich_text[0]?.plain_text || '',
      teamName: page.properties.TeamName?.rich_text[0]?.plain_text || '',
      members,
      demoUrl: page.properties.DemoUrl?.url || '',
      repoUrl: page.properties.RepoUrl?.url || '',
      screenshots,
      tags: page.properties.Tags?.multi_select?.map(t => t.name) || [],
      award: page.properties.Award?.rich_text[0]?.plain_text || '',
      isPublic: page.properties.IsPublic?.checkbox ?? true,
      submittedAt: page.created_time
    };
  });
};

export const getProjectById = async (id) => {
  const notion = getNotionClient();
  const page = await notion.pages.retrieve({ page_id: id });
  
  let members = [];
  try {
    const membersRaw = page.properties.Members?.rich_text[0]?.plain_text;
    if (membersRaw) members = JSON.parse(membersRaw);
  } catch (e) {}

  let screenshots = [];
  const screenshotsRaw = page.properties.Screenshots?.rich_text[0]?.plain_text;
  if (screenshotsRaw) screenshots = screenshotsRaw.split(',').map(s => s.trim());

  return {
    _id: page.id,
    title: page.properties.Title?.title[0]?.plain_text || '',
    description: page.properties.Description?.rich_text[0]?.plain_text || '',
    eventId: page.properties.EventId?.rich_text[0]?.plain_text || '',
    eventName: page.properties.EventName?.rich_text[0]?.plain_text || '',
    teamName: page.properties.TeamName?.rich_text[0]?.plain_text || '',
    members,
    demoUrl: page.properties.DemoUrl?.url || '',
    repoUrl: page.properties.RepoUrl?.url || '',
    screenshots,
    tags: page.properties.Tags?.multi_select?.map(t => t.name) || [],
    award: page.properties.Award?.rich_text[0]?.plain_text || '',
    isPublic: page.properties.IsPublic?.checkbox ?? true,
    submittedAt: page.created_time
  };
};

export const createProject = async (data) => {
  const notion = getNotionClient();
  const dbId = process.env.PROJECT_SHOWCASE_DB_ID;

  const membersStr = JSON.stringify(data.members || []);
  const screenshotsStr = (data.screenshots || []).join(',');

  const response = await notion.pages.create({
    parent: { database_id: dbId },
    properties: {
      Title: { title: [{ text: { content: data.title || '' } }] },
      Description: { rich_text: [{ text: { content: data.description || '' } }] },
      EventId: { rich_text: [{ text: { content: data.eventId || '' } }] },
      EventName: { rich_text: [{ text: { content: data.eventName || '' } }] },
      TeamName: { rich_text: [{ text: { content: data.teamName || '' } }] },
      Members: { rich_text: [{ text: { content: membersStr } }] },
      DemoUrl: { url: data.demoUrl || null },
      RepoUrl: { url: data.repoUrl || null },
      Screenshots: { rich_text: [{ text: { content: screenshotsStr } }] },
      Tags: { multi_select: (data.tags || []).map(tag => ({ name: tag })) },
      Award: { rich_text: [{ text: { content: data.award || '' } }] },
      IsPublic: { checkbox: data.isPublic !== false }
    }
  });

  return response;
};

export const updateProject = async (id, updates) => {
  const notion = getNotionClient();
  const properties = {};

  if (updates.isPublic !== undefined) {
    properties.IsPublic = { checkbox: updates.isPublic };
  }
  
  if (Object.keys(properties).length > 0) {
    await notion.pages.update({
      page_id: id,
      properties
    });
  }
};

export const deleteProject = async (id) => {
  const notion = getNotionClient();
  await notion.pages.update({
    page_id: id,
    archived: true
  });
};
