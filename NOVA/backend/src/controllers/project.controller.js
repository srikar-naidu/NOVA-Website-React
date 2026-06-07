import { v2 as cloudinary } from 'cloudinary';
import * as projectService from '../services/project.service.js';

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'nova-showcase',
        resource_type: 'image'
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

export const getProjects = async (req, res) => {
  try {
    const filters = {
      eventId: req.query.eventId,
      tags: req.query.tags
    };
    const projects = await projectService.getProjects(filters);
    res.json({ success: true, projects });
  } catch (error) {
    console.error('[Project] GET all error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch projects' });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    res.json({ success: true, project });
  } catch (error) {
    console.error('[Project] GET by id error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch project' });
  }
};

export const createProject = async (req, res) => {
  try {
    const { title, description, eventId, eventName, teamName, members, demoUrl, repoUrl, tags, award, isPublic } = req.body;
    
    // Parse JSON fields
    let parsedMembers = [];
    let parsedTags = [];
    try { if (members) parsedMembers = JSON.parse(members); } catch (e) {}
    try { if (tags) parsedTags = JSON.parse(tags); } catch (e) {}
    
    // Upload screenshots
    const screenshots = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadToCloudinary(file.buffer);
        screenshots.push(uploadResult.secure_url);
      }
    }

    const data = {
      title,
      description,
      eventId,
      eventName,
      teamName,
      members: parsedMembers,
      demoUrl,
      repoUrl,
      screenshots,
      tags: parsedTags,
      award,
      isPublic: isPublic === 'true'
    };

    const newProject = await projectService.createProject(data);
    res.json({ success: true, message: 'Project created', project: newProject });
  } catch (error) {
    console.error('[Project] POST error:', error);
    res.status(500).json({ success: false, error: 'Failed to create project' });
  }
};

export const updateProject = async (req, res) => {
  try {
    await projectService.updateProject(req.params.id, req.body);
    res.json({ success: true, message: 'Project updated' });
  } catch (error) {
    console.error('[Project] PATCH error:', error);
    res.status(500).json({ success: false, error: 'Failed to update project' });
  }
};

export const deleteProject = async (req, res) => {
  try {
    await projectService.deleteProject(req.params.id);
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    console.error('[Project] DELETE error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete project' });
  }
};
