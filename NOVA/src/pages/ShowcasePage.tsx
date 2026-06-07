import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Member {
  name: string;
  github?: string;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  eventId?: string;
  eventName: string;
  teamName?: string;
  members: Member[];
  demoUrl?: string;
  repoUrl?: string;
  screenshots: string[];
  tags: string[];
  award?: string;
  isPublic: boolean;
  submittedAt: string;
}

const ShowcasePage: React.FC = () => {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Filter & Sort States
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('newest');

  // Submit Modal States
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formEventName, setFormEventName] = useState('');
  const [formEventId, setFormEventId] = useState('');
  const [formTeamName, setFormTeamName] = useState('');
  const [formDemoUrl, setFormDemoUrl] = useState('');
  const [formRepoUrl, setFormRepoUrl] = useState('');
  const [formAward, setFormAward] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formIsPublic, setFormIsPublic] = useState(true);
  const [formMembers, setFormMembers] = useState<Member[]>([{ name: '', github: '' }]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Carousel State in Detail Modal
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      // Fetch all projects (backend handles returning public ones)
      const res = await fetch('http://localhost:3001/api/projects');
      const data = await res.json();
      if (data.success) {
        setAllProjects(data.projects || []);
      }
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Compute dynamic lists for filters
  const uniqueEvents = useMemo(() => {
    const events = allProjects.map(p => p.eventName).filter(Boolean);
    return Array.from(new Set(events));
  }, [allProjects]);

  const uniqueTags = useMemo(() => {
    const tags = allProjects.flatMap(p => p.tags || []).filter(Boolean);
    return Array.from(new Set(tags));
  }, [allProjects]);

  // Compute project statistics
  const stats = useMemo(() => {
    const totalCount = allProjects.length;
    const eventCount = uniqueEvents.length;
    return `${totalCount} project${totalCount !== 1 ? 's' : ''} across ${eventCount} event${eventCount !== 1 ? 's' : ''}`;
  }, [allProjects, uniqueEvents]);

  // Handle Tag toggle for multi-select filtering
  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Client-side filtering & sorting logic
  const filteredAndSortedProjects = useMemo(() => {
    let result = [...allProjects];

    // Filter by Event
    if (selectedEvent) {
      result = result.filter(p => p.eventName === selectedEvent);
    }

    // Filter by Tag (Must contain all selected tags)
    if (selectedTags.length > 0) {
      result = result.filter(p => 
        selectedTags.every(tag => p.tags && p.tags.includes(tag))
      );
    }

    // Sort logic
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    } else if (sortBy === 'awards') {
      result.sort((a, b) => {
        const aHasAward = a.award ? 1 : 0;
        const bHasAward = b.award ? 1 : 0;
        if (aHasAward !== bHasAward) {
          return bHasAward - aHasAward; // Awarded first
        }
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      });
    }

    return result;
  }, [allProjects, selectedEvent, selectedTags, sortBy]);

  // Detail Modal image change resets
  useEffect(() => {
    setActiveImageIndex(0);
  }, [selectedProject]);

  // Form Team Members helpers
  const handleMemberChange = (index: number, field: keyof Member, value: string) => {
    const updated = [...formMembers];
    updated[index][field] = value;
    setFormMembers(updated);
  };

  const addMemberField = () => {
    if (formMembers.length >= 5) {
      alert("A team can have a maximum of 5 members.");
      return;
    }
    setFormMembers([...formMembers, { name: '', github: '' }]);
  };

  const removeMemberField = (index: number) => {
    setFormMembers(formMembers.filter((_, i) => i !== index));
  };

  // Form Files preview helpers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (selectedFiles.length + files.length > 5) {
      alert("You can upload a maximum of 5 screenshots.");
      return;
    }
    const updatedFiles = [...selectedFiles, ...files];
    setSelectedFiles(updatedFiles);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setFilePreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemoveFile = (index: number) => {
    const fileToRevoke = filePreviews[index];
    if (fileToRevoke) {
      URL.revokeObjectURL(fileToRevoke);
    }
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    setFilePreviews(filePreviews.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormEventName('');
    setFormEventId('');
    setFormTeamName('');
    setFormDemoUrl('');
    setFormRepoUrl('');
    setFormAward('');
    setFormTags('');
    setFormIsPublic(true);
    setFormMembers([{ name: '', github: '' }]);
    filePreviews.forEach(url => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setFilePreviews([]);
    setErrorMsg('');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDescription.trim() || !formEventName.trim()) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    setErrorMsg('');

    try {
      const data = new FormData();
      data.append('title', formTitle);
      data.append('description', formDescription);
      data.append('eventName', formEventName);
      data.append('eventId', formEventId);
      data.append('teamName', formTeamName);
      data.append('demoUrl', formDemoUrl);
      data.append('repoUrl', formRepoUrl);
      data.append('award', formAward);
      data.append('isPublic', String(formIsPublic));

      const cleanedMembers = formMembers.filter(m => m.name.trim());
      data.append('members', JSON.stringify(cleanedMembers));

      const parsedTags = formTags.split(',').map(t => t.trim()).filter(Boolean);
      data.append('tags', JSON.stringify(parsedTags));

      selectedFiles.forEach(file => {
        data.append('screenshots', file);
      });

      const response = await fetch('http://localhost:3001/api/projects', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();
      if (result.success) {
        alert("Project submitted successfully!");
        resetForm();
        setIsSubmitModalOpen(false);
        fetchProjects();
      } else {
        setErrorMsg(result.error || "Failed to submit project.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An error occurred. Please make sure the backend server is running.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-24 min-h-screen bg-[#0a0a0f] text-white">
      {/* Page Header */}
      <div className="text-center mb-12 mt-6">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
          Project Showcase
        </h1>
        <p className="text-gray-400 text-lg mb-2">Projects built at NOVA events</p>
        <div className="inline-block bg-[#161622] border border-gray-800 text-sm text-gray-300 font-semibold px-4 py-1.5 rounded-full">
          {loading ? 'Counting projects...' : stats}
        </div>
      </div>

      {/* Filter / Sort / Action Bar */}
      <div className="bg-[#12121a] border border-gray-800 rounded-2xl p-6 mb-10 flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 flex-1">
            {/* Event Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Filter by Event</label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="bg-[#1a1a24] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500 min-w-[200px]"
              >
                <option value="">All Events</option>
                {uniqueEvents.map((evt, idx) => (
                  <option key={idx} value={evt}>{evt}</option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#1a1a24] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500 min-w-[180px]"
              >
                <option value="newest">Newest First</option>
                <option value="awards">Award Winners First</option>
              </select>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2 self-end transition-colors shadow-lg shadow-blue-900/30"
          >
            <i className="fas fa-plus"></i> Share Project
          </button>
        </div>

        {/* Tag Filters (Chips style multi-select) */}
        {uniqueTags.length > 0 && (
          <div className="border-t border-gray-800/80 pt-4 flex flex-col gap-2">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Filter by Technologies</span>
            <div className="flex flex-wrap gap-2">
              {uniqueTags.map((tag, idx) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={idx}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400 font-bold shadow-md shadow-blue-500/10'
                        : 'bg-[#1a1a24] border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading project database...</p>
        </div>
      ) : filteredAndSortedProjects.length === 0 ? (
        <div className="text-center py-24 bg-[#12121a] border border-gray-800 rounded-2xl">
          <i className="fas fa-folder-open text-4xl text-gray-600 mb-4"></i>
          <p className="text-gray-400 text-lg">No projects found matching the selected filters.</p>
          {(selectedEvent || selectedTags.length > 0) && (
            <button
              onClick={() => {
                setSelectedEvent('');
                setSelectedTags([]);
              }}
              className="mt-4 text-blue-400 hover:underline text-sm font-semibold"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAndSortedProjects.map((project) => (
            <motion.div
              key={project._id}
              whileHover={{ y: -6, boxShadow: "0 10px 30px rgba(0, 150, 255, 0.12)" }}
              className="bg-[#12121a] border border-gray-800/80 rounded-xl overflow-hidden cursor-pointer flex flex-col group transition-all duration-300"
              onClick={() => setSelectedProject(project)}
            >
              {/* Card Screenshot area */}
              <div className="h-48 bg-[#07070d] relative overflow-hidden flex items-center justify-center">
                {project.screenshots && project.screenshots.length > 0 ? (
                  <img
                    src={project.screenshots[0]}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 bg-[#0a0a0f] border-b border-gray-800">
                    <i className="fas fa-image text-3xl mb-2 text-gray-700"></i>
                    <span className="text-xs">No screenshot uploaded</span>
                  </div>
                )}

                {/* Award Badge in top-right */}
                {project.award && (
                  <div className="absolute top-3 right-3 bg-yellow-500/90 backdrop-blur-sm text-black text-xs font-extrabold px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1">
                    {project.award}
                  </div>
                )}
              </div>

              {/* Card content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] text-blue-400 mb-1.5 font-bold uppercase tracking-wider">
                    {project.eventName}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white group-hover:text-blue-400 transition-colors">
                    {project.title}
                  </h3>
                  
                  {/* Tech Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.tags.slice(0, 4).map((tag, i) => (
                      <span
                        key={i}
                        className="bg-[#181824] border border-gray-800/80 text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                    {project.tags.length > 4 && (
                      <span className="text-[10px] text-gray-500 font-bold self-center">
                        +{project.tags.length - 4} more
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-400 text-sm line-clamp-3 mb-6">
                    {project.description}
                  </p>
                </div>

                <div>
                  {/* Team Members */}
                  {project.teamName && (
                    <div className="border-t border-gray-800/80 pt-3.5 mb-4">
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">
                        Team: {project.teamName}
                      </div>
                      {project.members && project.members.length > 0 && (
                        <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                          {project.members.map((member, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-xs text-gray-300">
                              <span>{member.name}</span>
                              {member.github && (
                                <a
                                  href={member.github}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-gray-500 hover:text-white transition-colors"
                                >
                                  <i className="fab fa-github"></i>
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Buttons Row */}
                  <div className="flex gap-2 border-t border-gray-800/60 pt-3">
                    {project.demoUrl ? (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 bg-blue-600/15 hover:bg-blue-600 border border-blue-500/30 hover:border-blue-500 text-blue-400 hover:text-white text-center py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <i className="fas fa-external-link-alt"></i> Live Demo
                      </a>
                    ) : (
                      <div className="flex-1 bg-gray-900/20 border border-gray-800/50 text-gray-600 text-center py-2 rounded-lg text-xs font-bold cursor-not-allowed select-none">
                        No Demo URL
                      </div>
                    )}

                    {project.repoUrl && (
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#181824] hover:bg-gray-800 border border-gray-700/80 hover:border-gray-600 text-gray-300 hover:text-white px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center"
                        title="GitHub Repository"
                      >
                        <i className="fab fa-github text-sm"></i>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-[#12121a] border border-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 bg-gray-900/60 hover:bg-gray-800 text-gray-400 hover:text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors z-20"
              >
                <i className="fas fa-times"></i>
              </button>

              <div className="p-6 md:p-8">
                {/* Modal Title Header */}
                <div className="mb-6">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                      {selectedProject.eventName}
                    </span>
                    {selectedProject.award && (
                      <span className="bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-xs font-bold px-3 py-0.5 rounded-full">
                        {selectedProject.award}
                      </span>
                    )}
                  </div>
                  <h2 className="text-3xl font-extrabold text-white">{selectedProject.title}</h2>
                </div>

                {/* Image Carousel */}
                {selectedProject.screenshots && selectedProject.screenshots.length > 0 ? (
                  <div className="mb-8 rounded-xl overflow-hidden bg-[#07070d] border border-gray-800/80 relative aspect-video flex items-center justify-center group/carousel">
                    <img
                      src={selectedProject.screenshots[activeImageIndex]}
                      alt={`${selectedProject.title} screenshot ${activeImageIndex + 1}`}
                      className="max-w-full max-h-[450px] object-contain"
                    />

                    {/* Carousel navigation arrows */}
                    {selectedProject.screenshots.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setActiveImageIndex(
                              (activeImageIndex - 1 + selectedProject.screenshots.length) %
                                selectedProject.screenshots.length
                            )
                          }
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 border border-gray-800 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all opacity-0 group-hover/carousel:opacity-100"
                        >
                          <i className="fas fa-chevron-left"></i>
                        </button>
                        <button
                          onClick={() =>
                            setActiveImageIndex(
                              (activeImageIndex + 1) % selectedProject.screenshots.length
                            )
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 border border-gray-800 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all opacity-0 group-hover/carousel:opacity-100"
                        >
                          <i className="fas fa-chevron-right"></i>
                        </button>
                      </>
                    )}

                    {/* Carousel index indicator dots */}
                    {selectedProject.screenshots.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/45 px-3 py-1.5 rounded-full backdrop-blur-sm">
                        {selectedProject.screenshots.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveImageIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              idx === activeImageIndex ? 'bg-blue-400 scale-125' : 'bg-gray-600'
                            }`}
                          ></button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mb-8 rounded-xl h-48 bg-[#0a0a0f] border border-gray-800/80 flex flex-col items-center justify-center text-gray-500">
                    <i className="fas fa-image text-3xl mb-2 text-gray-600"></i>
                    <span>No screenshot available for this project</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Left Column: Description */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-bold mb-3 border-b border-gray-800 pb-2 text-gray-200">
                      About the Project
                    </h3>
                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed text-sm">
                      {selectedProject.description}
                    </p>
                  </div>

                  {/* Right Column: Metadata & Links */}
                  <div className="space-y-6">
                    {/* Live and Source Links */}
                    <div>
                      <h3 className="text-lg font-bold mb-3 border-b border-gray-800 pb-2 text-gray-200">
                        Links
                      </h3>
                      <div className="flex flex-col gap-2.5">
                        {selectedProject.demoUrl && (
                          <a
                            href={selectedProject.demoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-blue-600 hover:bg-blue-700 text-center py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                          >
                            <i className="fas fa-external-link-alt"></i> Launch Live Demo
                          </a>
                        )}
                        {selectedProject.repoUrl && (
                          <a
                            href={selectedProject.repoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-[#1a1a24] border border-gray-700 hover:bg-gray-800 text-center py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                          >
                            <i className="fab fa-github"></i> View GitHub Repository
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Team Members List */}
                    {selectedProject.teamName && (
                      <div>
                        <h3 className="text-lg font-bold mb-3 border-b border-gray-800 pb-2 text-gray-200">
                          Team: {selectedProject.teamName}
                        </h3>
                        {selectedProject.members && selectedProject.members.length > 0 ? (
                          <ul className="space-y-2.5">
                            {selectedProject.members.map((member, i) => (
                              <li key={i} className="text-gray-300 text-sm flex items-center justify-between bg-[#161622] px-3.5 py-2 rounded-lg border border-gray-800">
                                <span className="font-semibold">{member.name}</span>
                                {member.github && (
                                  <a
                                    href={member.github}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-xs"
                                  >
                                    <i className="fab fa-github"></i> Profile
                                  </a>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-xs text-gray-500">No member info provided</span>
                        )}
                      </div>
                    )}

                    {/* Tech Stack tags */}
                    <div>
                      <h3 className="text-lg font-bold mb-3 border-b border-gray-800 pb-2 text-gray-200">
                        Tech Stack
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="bg-[#181824] border border-gray-800 text-gray-300 text-xs px-2.5 py-1 rounded-md font-semibold"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share / Post Project Form Modal */}
      <AnimatePresence>
        {isSubmitModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => {
              if (!submitting) {
                resetForm();
                setIsSubmitModalOpen(false);
              }
            }}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-[#12121a] border border-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                disabled={submitting}
                onClick={() => {
                  resetForm();
                  setIsSubmitModalOpen(false);
                }}
                className="absolute top-4 right-4 bg-gray-900/60 hover:bg-gray-800 text-gray-400 hover:text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors z-20"
              >
                <i className="fas fa-times"></i>
              </button>

              <div className="p-6 md:p-8">
                <h2 className="text-2xl font-bold mb-1 text-blue-400">Share Your Project</h2>
                <p className="text-gray-400 text-sm mb-6">List your project on the NOVA Event Showcase</p>

                {errorMsg && (
                  <div className="bg-red-950/40 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
                    <i className="fas fa-exclamation-circle mt-0.5"></i>
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleFormSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Project Title *</label>
                      <input
                        disabled={submitting}
                        type="text"
                        required
                        placeholder="e.g. My Awesome Hack"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="bg-[#1a1a24] border border-gray-700/80 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-gray-600"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Team Name</label>
                      <input
                        disabled={submitting}
                        type="text"
                        placeholder="e.g. The Innovators"
                        value={formTeamName}
                        onChange={(e) => setFormTeamName(e.target.value)}
                        className="bg-[#1a1a24] border border-gray-700/80 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-gray-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Event Name *</label>
                      <input
                        disabled={submitting}
                        type="text"
                        required
                        placeholder="e.g. Ideasprint 2026"
                        value={formEventName}
                        onChange={(e) => setFormEventName(e.target.value)}
                        className="bg-[#1a1a24] border border-gray-700/80 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-gray-600"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Event ID (Optional)</label>
                      <input
                        disabled={submitting}
                        type="text"
                        placeholder="e.g. ideasprint26"
                        value={formEventId}
                        onChange={(e) => setFormEventId(e.target.value)}
                        className="bg-[#1a1a24] border border-gray-700/80 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-gray-600"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Description *</label>
                    <textarea
                      disabled={submitting}
                      required
                      placeholder="Detail what your project does, the problem it solves, and how it works..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full bg-[#1a1a24] border border-gray-700/80 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 h-28 resize-none placeholder-gray-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Live Demo URL</label>
                      <input
                        disabled={submitting}
                        type="url"
                        placeholder="https://..."
                        value={formDemoUrl}
                        onChange={(e) => setFormDemoUrl(e.target.value)}
                        className="bg-[#1a1a24] border border-gray-700/80 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-gray-600"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">GitHub Repo URL</label>
                      <input
                        disabled={submitting}
                        type="url"
                        placeholder="https://github.com/..."
                        value={formRepoUrl}
                        onChange={(e) => setFormRepoUrl(e.target.value)}
                        className="bg-[#1a1a24] border border-gray-700/80 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-gray-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Tags (comma separated)</label>
                      <input
                        disabled={submitting}
                        type="text"
                        placeholder="React, Node.js, Tailwind"
                        value={formTags}
                        onChange={(e) => setFormTags(e.target.value)}
                        className="bg-[#1a1a24] border border-gray-700/80 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-gray-600"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Awards Won (Optional)</label>
                      <input
                        disabled={submitting}
                        type="text"
                        placeholder="e.g. 1st Place, Best UI"
                        value={formAward}
                        onChange={(e) => setFormAward(e.target.value)}
                        className="bg-[#1a1a24] border border-gray-700/80 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-gray-600"
                      />
                    </div>
                  </div>

                  {/* Team Members dynamic rows */}
                  <div className="bg-[#161622] p-4 rounded-xl border border-gray-800">
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-xs text-gray-300 font-bold uppercase tracking-wider">Team Members (Max 5)</label>
                      <button
                        disabled={submitting || formMembers.length >= 5}
                        type="button"
                        onClick={addMemberField}
                        className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 disabled:opacity-40"
                      >
                        <i className="fas fa-plus"></i> Add Member
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {formMembers.map((member, idx) => (
                        <div key={idx} className="flex gap-2.5 items-center">
                          <input
                            disabled={submitting}
                            type="text"
                            required
                            placeholder="Member Name"
                            value={member.name}
                            onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                            className="bg-[#1a1a24] border border-gray-700/80 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 flex-1 placeholder-gray-600"
                          />
                          <input
                            disabled={submitting}
                            type="url"
                            placeholder="GitHub Link (https://...)"
                            value={member.github || ''}
                            onChange={(e) => handleMemberChange(idx, 'github', e.target.value)}
                            className="bg-[#1a1a24] border border-gray-700/80 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 flex-1 placeholder-gray-600"
                          />
                          {formMembers.length > 1 && (
                            <button
                              disabled={submitting}
                              type="button"
                              onClick={() => removeMemberField(idx)}
                              className="bg-red-950/40 hover:bg-red-900/40 border border-red-900/30 text-red-400 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                            >
                              <i className="fas fa-trash-alt text-xs"></i>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Screenshots file selection & previews */}
                  <div className="bg-[#161622] p-4 rounded-xl border border-gray-800">
                    <label className="text-xs text-gray-300 font-bold uppercase tracking-wider block mb-2">
                      Screenshots / Images (Max 5)
                    </label>
                    <input
                      disabled={submitting || selectedFiles.length >= 5}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="bg-[#1a1a24] border border-gray-700/80 rounded-lg p-2.5 text-xs text-gray-400 w-full file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30 file:cursor-pointer disabled:opacity-40"
                    />

                    {/* Previews Grid */}
                    {filePreviews.length > 0 && (
                      <div className="grid grid-cols-5 gap-2.5 mt-4">
                        {filePreviews.map((url, idx) => (
                          <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-gray-700 group bg-black">
                            <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              disabled={submitting}
                              type="button"
                              onClick={() => handleRemoveFile(idx)}
                              className="absolute top-1 right-1 bg-red-600/90 hover:bg-red-700 text-white rounded-full w-5 h-5 flex items-center justify-center transition-colors text-[9px] shadow-lg"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        disabled={submitting}
                        type="checkbox"
                        checked={formIsPublic}
                        onChange={(e) => setFormIsPublic(e.target.checked)}
                        className="rounded border-gray-700 text-blue-600 focus:ring-blue-500 bg-[#1a1a24] w-4 h-4"
                      />
                      <span className="text-xs text-gray-300 font-semibold">Make Project Public Immediately</span>
                    </label>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg transition-colors flex items-center gap-2 disabled:bg-gray-800 disabled:text-gray-500 shadow-lg shadow-blue-900/30"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane"></i> Publish Showcase
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShowcasePage;
