import { Client } from '@notionhq/client';

const getNotionClient = () => {
  return new Client({
    auth: process.env.NOTION_API_KEY,
  });
};

export const getPosts = async (filters) => {
  const notion = getNotionClient();
  const dbId = process.env.TEAM_FINDER_DB_ID;
  
  const filter = {
    and: [
      { property: 'IsOpen', checkbox: { equals: true } }
    ]
  };

  if (filters.skills) {
    const skillList = filters.skills.split(',').map(s => s.trim());
    skillList.forEach(skill => {
      filter.and.push({
        property: 'Skills',
        multi_select: { contains: skill }
      });
    });
  }
  if (filters.branch) {
    filter.and.push({ property: 'Branch', rich_text: { contains: filters.branch } });
  }
  if (filters.year) {
    filter.and.push({ property: 'Year', rich_text: { contains: filters.year } });
  }

  const response = await notion.databases.query({
    database_id: dbId,
    filter,
    sorts: [{ timestamp: 'created_time', direction: 'descending' }]
  });

  return response.results.map(page => ({
    _id: page.id,
    userId: page.properties.UserId?.rich_text[0]?.plain_text || '',
    userName: page.properties.Name?.title[0]?.plain_text || '',
    userEmail: page.properties.Email?.email || '',
    title: page.properties.Title?.rich_text[0]?.plain_text || '',
    description: page.properties.Description?.rich_text[0]?.plain_text || '',
    skills: page.properties.Skills?.multi_select?.map(s => s.name) || [],
    lookingFor: page.properties.LookingFor?.rich_text[0]?.plain_text || '',
    eventId: page.properties.EventId?.rich_text[0]?.plain_text || '',
    contactInfo: page.properties.ContactInfo?.rich_text[0]?.plain_text || '',
    branch: page.properties.Branch?.rich_text[0]?.plain_text || '',
    year: page.properties.Year?.rich_text[0]?.plain_text || '',
    githubLink: page.properties.GithubLink?.url || '',
    linkedinLink: page.properties.LinkedinLink?.url || '',
    isOpen: page.properties.IsOpen?.checkbox ?? true,
    createdAt: page.created_time
  }));
};

export const createPost = async (data) => {
  const notion = getNotionClient();
  const dbId = process.env.TEAM_FINDER_DB_ID;

  const response = await notion.pages.create({
    parent: { database_id: dbId },
    properties: {
      Name: { title: [{ text: { content: data.userName || '' } }] },
      UserId: { rich_text: [{ text: { content: data.userId || '' } }] },
      Email: { email: data.userEmail || null },
      Title: { rich_text: [{ text: { content: data.title || '' } }] },
      Description: { rich_text: [{ text: { content: data.description || '' } }] },
      Skills: { multi_select: (data.skills || []).map(skill => ({ name: skill })) },
      LookingFor: { rich_text: [{ text: { content: data.lookingFor || '' } }] },
      EventId: { rich_text: [{ text: { content: data.eventId || '' } }] },
      ContactInfo: { rich_text: [{ text: { content: data.contactInfo || '' } }] },
      Branch: { rich_text: [{ text: { content: data.branch || '' } }] },
      Year: { rich_text: [{ text: { content: data.year || '' } }] },
      GithubLink: { url: data.githubLink || null },
      LinkedinLink: { url: data.linkedinLink || null },
      IsOpen: { checkbox: true }
    }
  });

  return response;
};

export const closePost = async (postId) => {
  const notion = getNotionClient();
  await notion.pages.update({
    page_id: postId,
    properties: {
      IsOpen: { checkbox: false }
    }
  });
};

export const deletePost = async (postId) => {
  const notion = getNotionClient();
  await notion.pages.update({
    page_id: postId,
    archived: true
  });
};

export const getPostById = async (postId) => {
  const notion = getNotionClient();
  const page = await notion.pages.retrieve({ page_id: postId });
  return {
    _id: page.id,
    userId: page.properties.UserId?.rich_text[0]?.plain_text || ''
  };
};
