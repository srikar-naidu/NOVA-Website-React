import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ShowcasePage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [filterTag, setFilterTag] = useState('');
  const [filterEvent, setFilterEvent] = useState('');

  const fetchProjects = async () => {
    try {
      let url = 'http://localhost:3001/api/projects?';
      if (filterTag) url += `tags=${filterTag}&`;
      if (filterEvent) url += `eventId=${filterEvent}`;
      
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setProjects(data.projects);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [filterTag, filterEvent]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 min-h-screen bg-[#0a0a0f] text-white">
      <div className="text-center mb-12 mt-10">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-4">Project Showcase</h1>
        <p className="text-gray-400 text-lg">Discover amazing projects built at NOVA events</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8 justify-center">
        <input 
          type="text" 
          placeholder="Filter by Tech (e.g. React)" 
          className="bg-[#1a1a24] border border-gray-700 rounded-lg p-2 text-white"
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
        />
        <input 
          type="text" 
          placeholder="Filter by Event" 
          className="bg-[#1a1a24] border border-gray-700 rounded-lg p-2 text-white"
          value={filterEvent}
          onChange={(e) => setFilterEvent(e.target.value)}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <motion.div 
              key={project._id} 
              whileHover={{ y: -5, boxShadow: "0 0 20px rgba(0, 150, 255, 0.2)" }}
              className="bg-[#12121a] border border-gray-800 rounded-xl overflow-hidden cursor-pointer"
              onClick={() => setSelectedProject(project)}
            >
              <div className="h-48 bg-[#0a0a0f] relative">
                {project.screenshots?.length > 0 ? (
                  <img src={project.screenshots[0]} alt="Screenshot" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">No Image</div>
                )}
                {project.award && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    🏆 {project.award}
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="text-xs text-blue-400 mb-1 font-semibold">{project.eventName}</div>
                <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="bg-[#1a1a24] text-gray-300 text-xs px-2 py-1 rounded">{tag}</span>
                  ))}
                </div>
                <p className="text-gray-400 text-sm line-clamp-2">{project.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div 
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-[#12121a] border border-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{selectedProject.title}</h2>
                    <p className="text-blue-400 font-semibold">{selectedProject.eventName}</p>
                  </div>
                  <button onClick={() => setSelectedProject(null)} className="text-gray-500 hover:text-white text-2xl">&times;</button>
                </div>

                {selectedProject.screenshots?.length > 0 && (
                  <div className="mb-6 rounded-xl overflow-hidden bg-[#0a0a0f]">
                    <img src={selectedProject.screenshots[0]} alt="Screenshot" className="w-full h-auto max-h-[400px] object-contain" />
                  </div>
                )}

                <div className="grid md:grid-cols-3 gap-8">
                  <div className="md:col-span-2">
                    <h3 className="text-xl font-semibold mb-3 border-b border-gray-800 pb-2">About</h3>
                    <p className="text-gray-300 whitespace-pre-wrap">{selectedProject.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-3 border-b border-gray-800 pb-2">Links</h3>
                    <div className="flex flex-col gap-3 mb-6">
                      {selectedProject.demoUrl && (
                        <a href={selectedProject.demoUrl} target="_blank" rel="noreferrer" className="bg-blue-600 hover:bg-blue-700 text-center py-2 rounded-lg font-semibold transition-colors">
                          Live Demo
                        </a>
                      )}
                      {selectedProject.repoUrl && (
                        <a href={selectedProject.repoUrl} target="_blank" rel="noreferrer" className="bg-[#1a1a24] border border-gray-700 hover:bg-gray-800 text-center py-2 rounded-lg font-semibold transition-colors">
                          GitHub Repo
                        </a>
                      )}
                    </div>

                    <h3 className="text-xl font-semibold mb-3 border-b border-gray-800 pb-2">Team: {selectedProject.teamName}</h3>
                    <ul className="space-y-2 mb-6">
                      {selectedProject.members?.map((m, i) => (
                        <li key={i} className="text-gray-300 flex items-center justify-between">
                          <span>{m.name}</span>
                          {m.github && (
                            <a href={m.github} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-sm">GitHub</a>
                          )}
                        </li>
                      ))}
                    </ul>

                    <h3 className="text-xl font-semibold mb-3 border-b border-gray-800 pb-2">Tech Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.tags.map((tag, i) => (
                        <span key={i} className="bg-[#1a1a24] border border-gray-800 text-gray-300 text-sm px-2 py-1 rounded">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShowcasePage;
