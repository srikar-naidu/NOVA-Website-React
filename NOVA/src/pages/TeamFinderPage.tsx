import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser, SignInButton, useAuth } from '@clerk/clerk-react';

interface TeamPost {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  title: string;
  description: string;
  skills: string[];
  lookingFor: string;
  eventId?: string;
  contactInfo: string;
  isOpen: boolean;
  createdAt: string;
}

const TeamFinderPage: React.FC = () => {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();

  const [posts, setPosts] = useState<TeamPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterSkill, setFilterSkill] = useState('');

  // Form state — name and email are auto-filled from Clerk
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    lookingFor: '',
    contactInfo: '',
    eventId: ''
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');

  const fetchPosts = async () => {
    try {
      const url = filterSkill ? `/api/teamfinder?skills=${filterSkill}` : '/api/teamfinder';
      const res = await fetch(`http://localhost:3001${url}`);
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error('Error fetching posts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [filterSkill]);

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentSkill.trim()) {
      e.preventDefault();
      if (!skills.includes(currentSkill.trim())) {
        setSkills([...skills, currentSkill.trim()]);
      }
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.contactInfo) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const token = await getToken();
      const res = await fetch('http://localhost:3001/api/teamfinder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userName: user?.fullName || user?.firstName || 'Anonymous',
          userEmail: user?.primaryEmailAddress?.emailAddress || '',
          ...formData,
          skills
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setFormData({ title: '', description: '', lookingFor: '', contactInfo: '', eventId: '' });
        setSkills([]);
        fetchPosts();
      } else {
        alert(data.error || 'Failed to create post');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating post');
    }
  };

  const handleClosePost = async (postId: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:3001/api/teamfinder/${postId}/close`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        fetchPosts();
      } else {
        alert(data.error || 'Could not close post');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Check if post belongs to the currently signed-in user
  const isMyPost = (post: TeamPost) => {
    return isSignedIn && user?.id === post.userId;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 mt-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 mb-4">Find a Squad</h1>
          <p className="text-gray-400 text-lg">Looking for teammates? Post your profile or browse open positions.</p>
        </div>

        {isSignedIn ? (
          <button
            onClick={() => setShowForm(!showForm)}
            className="mt-6 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold transition-all shadow-[0_0_15px_rgba(37,99,235,0.5)]"
          >
            {showForm ? 'Cancel' : 'Post Your Profile'}
          </button>
        ) : (
          <SignInButton mode="modal">
            <button className="mt-6 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold transition-all shadow-[0_0_15px_rgba(37,99,235,0.5)]">
              Sign In to Post
            </button>
          </SignInButton>
        )}
      </div>

      {/* Signed-in user info banner */}
      {isSignedIn && showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111116] p-8 rounded-2xl border border-gray-800 mb-12"
        >
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-800">
            <img src={user?.imageUrl} alt="avatar" className="w-10 h-10 rounded-full border border-gray-700" />
            <div>
              <p className="text-white font-semibold">{user?.fullName || user?.firstName}</p>
              <p className="text-gray-500 text-sm">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-6">Create a Post</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-400 mb-2">Headline / Title *</label>
              <input type="text" placeholder="e.g. Frontend Dev looking for a Hackathon Team" className="w-full bg-[#1a1a24] border border-gray-700 rounded-lg p-3 text-white" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Description *</label>
              <textarea rows={3} className="w-full bg-[#1a1a24] border border-gray-700 rounded-lg p-3 text-white" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Skills (Type and press Enter)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {skills.map(skill => (
                  <span key={skill} className="bg-blue-900 text-blue-200 px-3 py-1 rounded-full text-sm flex items-center">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)} className="ml-2 text-blue-400 hover:text-white">&times;</button>
                  </span>
                ))}
              </div>
              <input type="text" className="w-full bg-[#1a1a24] border border-gray-700 rounded-lg p-3 text-white" placeholder="Add a skill" value={currentSkill} onChange={e => setCurrentSkill(e.target.value)} onKeyDown={handleAddSkill} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-400 mb-2">Looking For</label>
                <input type="text" placeholder="e.g. 1 UI Designer" className="w-full bg-[#1a1a24] border border-gray-700 rounded-lg p-3 text-white" value={formData.lookingFor} onChange={e => setFormData({...formData, lookingFor: e.target.value})} />
              </div>
              <div>
                <label className="block text-gray-400 mb-2">Contact Info (WhatsApp/Link) *</label>
                <input type="text" className="w-full bg-[#1a1a24] border border-gray-700 rounded-lg p-3 text-white" required value={formData.contactInfo} onChange={e => setFormData({...formData, contactInfo: e.target.value})} />
              </div>
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-bold">Submit Post</button>
          </form>
        </motion.div>
      )}

      {/* Filter */}
      <div className="mb-8 flex items-center gap-4">
        <input
          type="text"
          placeholder="Filter by skill..."
          className="bg-[#1a1a24] border border-gray-800 rounded-lg p-3 text-white w-full md:w-64"
          value={filterSkill}
          onChange={e => setFilterSkill(e.target.value)}
        />
        {filterSkill && <button onClick={() => setFilterSkill('')} className="text-gray-400 hover:text-white">Clear</button>}
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div className="text-center text-gray-400">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="text-center text-gray-500 bg-[#111116] p-10 rounded-xl border border-gray-800">No open posts found. Be the first to post!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-[#111116] border border-gray-800 hover:border-blue-500/50 transition-colors rounded-xl p-6 flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white">{post.title}</h3>
                {isMyPost(post) && (
                  <button onClick={() => handleClosePost(post._id)} className="text-xs bg-red-900/50 text-red-400 px-2 py-1 rounded hover:bg-red-900 transition-colors">Close</button>
                )}
              </div>
              <p className="text-gray-400 text-sm mb-4 line-clamp-3">{post.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {post.skills.map((skill, i) => (
                  <span key={i} className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-md">{skill}</span>
                ))}
              </div>

              <div className="mt-auto pt-4 border-t border-gray-800">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Posted By</p>
                    <p className="text-gray-300 text-sm">{post.userName}</p>
                  </div>
                  {post.lookingFor && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Looking For</p>
                      <p className="text-emerald-400 text-sm">{post.lookingFor}</p>
                    </div>
                  )}
                </div>
                <a
                  href={post.contactInfo.includes('http') ? post.contactInfo : `mailto:${post.contactInfo}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full text-center bg-[#1a1a24] hover:bg-[#252535] text-white py-2 rounded-lg transition-colors border border-gray-700 font-semibold"
                >
                  Connect
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamFinderPage;
