// src/modules/projects/pages/ProjectListPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services/project.service';
import PageContainer from '../../../shared/components/PageContainer';
import { CardSkeleton } from '../../../shared/components/Skeletons';

const ProjectListPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const res = await projectService.getAllProjects();
      if (res.success) setProjects(res.data);
      else setProjects([]); // Fallback to empty if failed
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <PageContainer>
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700 animate-in fade-in duration-300">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Projects</h2>
          <button className="px-5 py-2.5 bg-[#0f62fe] text-white text-sm font-bold rounded-xl shadow-md hover:bg-blue-700 transition-all">
            + New Project
          </button>
        </div>

        <div className="relative w-full mb-8">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </span>
          <input 
            type="text" 
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#0f62fe] outline-none dark:text-white" 
            placeholder="Search Project Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isLoading ? (
          <CardSkeleton count={3} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <div 
                key={project.id} 
                onClick={() => navigate(`/projects/${project.id}`)}
                className="p-6 border border-gray-100 dark:border-gray-700 rounded-3xl hover:border-[#0f62fe] dark:hover:border-blue-500 cursor-pointer transition-all bg-white dark:bg-gray-800 group"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-[#0f62fe] dark:text-blue-400 px-2 py-1 rounded font-black uppercase">Ongoing</span>
                  <p className="text-xs text-gray-400 font-bold">{project.location}</p>
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white group-hover:text-[#0f62fe] mb-6">{project.name}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs"><span className="text-gray-400 font-bold uppercase">Progress</span><span className="font-black text-[#0f62fe]">65%</span></div>
                  <div className="w-full bg-gray-100 dark:bg-gray-900 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#0f62fe] h-full w-[65%] rounded-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default ProjectListPage;