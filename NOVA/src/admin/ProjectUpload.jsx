import React, { useState } from 'react';

const ProjectUpload = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventId: '',
    eventName: '',
    teamName: '',
    demoUrl: '',
    repoUrl: '',
    award: '',
    tags: '',
    isPublic: true
  });
  
  const [members, setMembers] = useState([{ name: '', github: '' }]);
  const [images, setImages] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMemberChange = (index, field, value) => {
    const newMembers = [...members];
    newMembers[index][field] = value;
    setMembers(newMembers);
  };

  const addMember = () => setMembers([...members, { name: '', github: '' }]);
  const removeMember = (index) => setMembers(members.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      
      data.append('members', JSON.stringify(members));
      
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
      data.append('tags', JSON.stringify(tagsArray));

      if (images) {
        for (let i = 0; i < images.length; i++) {
          data.append('screenshots', images[i]);
        }
      }

      const token = localStorage.getItem('adminToken'); // Assuming token is here

      const res = await fetch('http://localhost:3001/api/projects', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });

      const result = await res.json();
      if (result.success) {
        alert('Project uploaded successfully!');
        setFormData({ title: '', description: '', eventId: '', eventName: '', teamName: '', demoUrl: '', repoUrl: '', award: '', tags: '', isPublic: true });
        setMembers([{ name: '', github: '' }]);
        setImages(null);
        e.target.reset();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#12121a] p-6 rounded-xl border border-gray-800 text-white mt-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-400">Upload Project to Showcase</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <input name="title" placeholder="Project Title *" required onChange={handleChange} value={formData.title} className="bg-[#1a1a24] p-3 rounded-lg border border-gray-700" />
          <input name="teamName" placeholder="Team Name" onChange={handleChange} value={formData.teamName} className="bg-[#1a1a24] p-3 rounded-lg border border-gray-700" />
          <input name="eventName" placeholder="Event Name *" required onChange={handleChange} value={formData.eventName} className="bg-[#1a1a24] p-3 rounded-lg border border-gray-700" />
          <input name="eventId" placeholder="Event ID" onChange={handleChange} value={formData.eventId} className="bg-[#1a1a24] p-3 rounded-lg border border-gray-700" />
        </div>
        
        <textarea name="description" placeholder="Project Description *" required onChange={handleChange} value={formData.description} className="w-full bg-[#1a1a24] p-3 rounded-lg border border-gray-700 h-32" />

        <div className="grid grid-cols-2 gap-4">
          <input name="demoUrl" placeholder="Live Demo URL" type="url" onChange={handleChange} value={formData.demoUrl} className="bg-[#1a1a24] p-3 rounded-lg border border-gray-700" />
          <input name="repoUrl" placeholder="GitHub Repo URL" type="url" onChange={handleChange} value={formData.repoUrl} className="bg-[#1a1a24] p-3 rounded-lg border border-gray-700" />
          <input name="award" placeholder="Award (e.g. 1st Place)" onChange={handleChange} value={formData.award} className="bg-[#1a1a24] p-3 rounded-lg border border-gray-700" />
          <input name="tags" placeholder="Tags (comma separated)" onChange={handleChange} value={formData.tags} className="bg-[#1a1a24] p-3 rounded-lg border border-gray-700" />
        </div>

        <div>
          <h3 className="font-semibold mb-2">Team Members</h3>
          {members.map((m, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input placeholder="Name" value={m.name} onChange={(e) => handleMemberChange(i, 'name', e.target.value)} className="bg-[#1a1a24] p-2 rounded border border-gray-700 flex-1" />
              <input placeholder="GitHub URL" value={m.github} onChange={(e) => handleMemberChange(i, 'github', e.target.value)} className="bg-[#1a1a24] p-2 rounded border border-gray-700 flex-1" />
              <button type="button" onClick={() => removeMember(i)} className="bg-red-900/50 text-red-400 px-3 rounded hover:bg-red-900">X</button>
            </div>
          ))}
          <button type="button" onClick={addMember} className="text-blue-400 text-sm hover:underline">+ Add Member</button>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Screenshots (Max 5)</h3>
          <input type="file" multiple accept="image/*" onChange={(e) => setImages(e.target.files)} className="bg-[#1a1a24] p-2 rounded-lg border border-gray-700 w-full" />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors">
          {loading ? 'Uploading...' : 'Publish Project'}
        </button>
      </form>
    </div>
  );
};

export default ProjectUpload;
