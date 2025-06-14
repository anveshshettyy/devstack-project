import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import axios from 'axios';
import Navbar from "../Components/Navbar";
import CreateProjectDrawer from '../Components/Project/CreateProjectDrawer';
import EditProjectDrawer from '../Components/Project/EditProjectDrawer';
import CreateIcon from '../assets/Images/add.png';
import CreateIconB from '../assets/Images/addB.png';
import DeleteIcon from '../assets/Images/delete.png';
import DeleteIconB from '../assets/Images/deleteB.png';
import ProjectIcon from '../assets/Images/project.png';
import EditIcon from '../assets/Images/edit.png';
import CustomAlert from '../Components/CustomAlert';
import ConfirmPopup from '../Components/ConfirmPopup';

export default function ProjectList() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [isUploading, setIsUploading] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
    const [projects, setProjects] = useState([]);
    const [category, setCategory] = useState(null);
    const [showCreateDrawer, setShowCreateDrawer] = useState(false);
    const [createTitle, setCreateTitle] = useState('');
    const [createDescription, setCreateDescription] = useState('');
    const [editingProject, setEditingProject] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [about, setAbout] = useState('');
    const [source, setSource] = useState('');
    const [liveDemo, setLiveDemo] = useState('');
    const [technologies, setTechnologies] = useState('');
    const [images, setImages] = useState(null);
    const [video, setVideo] = useState(null);

    // Confirmation popup state
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [onConfirmCallback, setOnConfirmCallback] = useState(() => () => { });

    const confirmProjectDelete = (projectId) => {
        setPopupMessage("This project will be permanently deleted. Continue?");
        setOnConfirmCallback(() => () => handleDelete(projectId));
        setShowPopup(true);
    };

    const cancelPopup = () => {
        setShowPopup(false);
        setOnConfirmCallback(() => () => { });
    };

    const handleDelete = async (projectId) => {
        try {
            await axios.delete(`/api/projects/delete/${projectId}`, { withCredentials: true });
            setProjects((prev) => prev.filter((p) => p._id !== projectId));
            setAlert({ show: true, message: "Project deleted successfully", type: "success" });
            setShowPopup(false);
        } catch (error) {
            console.error("Error deleting project:", error);
            setAlert({ show: true, message: "Failed to delete project", type: "error" });
        }
    };

    const handleImageUpload = (e) => {
        setImages(e.target.files);
    };

    const handleVideoUpload = (e) => {
        setVideo(e.target.files[0]);
    };

    useEffect(() => {
        if (!id) return;
        const fetchCategoryAndProjects = async () => {
            try {
                const res = await axios.get(`/api/projects/${id}`, { withCredentials: true });
                setCategory(res.data.category);
                setProjects(res.data.projects);
            } catch (error) {
                console.error('Error fetching category projects:', error);
            }
        };
        fetchCategoryAndProjects();
    }, [id]);

    useEffect(() => {
        if (alert.show) {
            const timer = setTimeout(() => {
                setAlert(prev => ({ ...prev, show: false }));
            }, 3000);

            return () => clearTimeout(timer); 
        }
    }, [alert.show]);

    const handleCreate = async () => {
        setIsUploading(true); 
        setShowCreateDrawer(false); 

        try {
            const formData = new FormData();
            formData.append('title', createTitle);
            formData.append('description', createDescription);
            formData.append('about', about);
            formData.append('source', source);
            formData.append('liveDemo', liveDemo);
            formData.append('technologies', technologies);

            if (images && images.length > 0) {
                for (let i = 0; i < images.length; i++) {
                    formData.append('images', images[i]);
                }
            }
            if (video) {
                formData.append('video', video);
            }

            const res = await axios.post(
                `/api/projects/create/${category._id}`,
                formData,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            setProjects((prev) => [...prev, res.data.project]);
            setCreateTitle('');
            setCreateDescription('');
            setAbout('');
            setSource('');
            setLiveDemo('');
            setTechnologies('');
            setImages(null);
            setVideo(null);

            setAlert({
                show: true,
                message: "Successfully created your project.",
                type: "success"
            });
        } catch (error) {
            setAlert({
                show: true,
                message: "Failed to create project. Please try again.",
                type: "error"
            });
            console.error("Error creating project:", error);
        } finally {
            setIsUploading(false); 
        }
    };

    const handleEditClick = (project) => {
        setEditingProject(project);
        setEditTitle(project.title);
        setEditDescription(project.description || '');
    };

    const handleUpdate = async () => {
        if (!editingProject || !editingProject._id) return;

        try {
            const res = await axios.post(
                `/api/projects/update/${editingProject._id}`,
                { title: editTitle, description: editDescription },
                { withCredentials: true }
            );

            setProjects((prev) =>
                prev.map((p) => (p._id === res.data.project._id ? res.data.project : p))
            );

            setEditingProject(null);
            setEditTitle('');
            setEditDescription('');
        } catch (error) {
            console.error("Error updating project:", error);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="flex items-center gap-x-3 font-med text-gray-700 md:px-15 px-3">
                <Link to="/collections" className="hover:underline">
                    Collections
                </Link>
                <ChevronRight className="w-4 h-4" />
                <h1 className=" font-semibold text-black ">Projects</h1>
            </div>

            <div className="p-3 md:p-15 md:flex md:justify-between md:items-center">

                <h1 className="text-5xl font-head">Your Projects</h1>

                <div className="flex justify-around items-center font-med gap-3 text-gray-500 mt-5 text-sm md:text-[2.3vh]">
                    <div
                        className={`group border-2 rounded-2xl p-2 flex cursor-pointer items-center gap-2 transition duration-200 ${showCreateDrawer
                            ? 'border-black text-black shadow-lg'
                            : 'border-gray-500 hover:border-black hover:text-black hover:shadow-lg'
                            }`}
                        onClick={() => setShowCreateDrawer(prev => !prev)}
                    >
                        <div className="relative h-5 w-5">
                            <img
                                className={`absolute inset-0 object-contain transition duration-200 ${showCreateDrawer ? 'opacity-0' : 'opacity-100 group-hover:opacity-0'}`}
                                src={CreateIcon}
                                alt="Create Default"
                            />
                            <img
                                className={`absolute inset-0 object-contain transition duration-200 ${showCreateDrawer ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                src={CreateIconB}
                                alt="Create Hover"
                            />
                        </div>
                        <h1>Create Project</h1>
                    </div>

                    <div className="group border-2 rounded-2xl border-gray-500 p-2 flex cursor-pointer items-center gap-2 hover:border-black hover:text-black hover:shadow-lg duration-200 transition">
                        <div className="relative h-5 w-5">
                            <img
                                className="absolute inset-0 object-contain opacity-100 group-hover:opacity-0 transition duration-200"
                                src={DeleteIcon}
                                alt="Delete Default"
                            />
                            <img
                                className="absolute inset-0 object-contain opacity-0 group-hover:opacity-100 transition duration-200"
                                src={DeleteIconB}
                                alt="Delete Hover"
                            />
                        </div>
                        <h1>Delete Project</h1>
                    </div>
                </div>
            </div>

            <div className="flex mt-5 md:mt-0 min-h-[90vh]">
                {/* <div className="w-1/3 bg-yellow-500 h-[100vh] hidden md:block"></div> */}

                <div className="w-full ">
                    {isUploading && (
                        <div className="w-full flex justify-center items-center py-3">
                            <div className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                </svg>
                                <span className="font-med text-black">Updating...</span>
                            </div>
                        </div>
                    )}

                    {showCreateDrawer && (
                        <div className="w-full flex justify-center pb-10">
                            <div className="w-[85%] animate-drawerSlideDown">
                                <CreateProjectDrawer
                                    onClose={() => setShowCreateDrawer(false)}
                                    onSubmit={handleCreate}
                                    title={createTitle}
                                    setTitle={setCreateTitle}
                                    description={createDescription}
                                    setDescription={setCreateDescription}
                                    about={about} setAbout={setAbout}
                                    source={source} setSource={setSource}
                                    liveDemo={liveDemo} setLiveDemo={setLiveDemo}
                                    technologies={technologies} setTechnologies={setTechnologies}
                                    handleImageUpload={handleImageUpload}
                                    handleVideoUpload={handleVideoUpload}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col items-center  justify-center md:gap-5 gap-4 rounded-2xl ">
                        {projects.length === 0 && (
                            <div className="text-center mt-10 text-slate-500">
                                <p className="text-lg mb-4">No projects found. Create one!</p>
                                <button
                                    onClick={() => setShowCreateDrawer(prev => !prev)}
                                    className="bg-black cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
                                >
                                    + Create Project
                                </button>
                            </div>
                        )}

                        {projects.map((project) => {
                            const isEditing = editingProject && editingProject._id === project._id;

                            return (
                                <div key={project._id} className="w-[90%] md:w-[90%] ">
                                    {isEditing ? (
                                        <div className="mb-8 md:mb-2 animate-drawerSlideDown">
                                            <EditProjectDrawer
                                                onClose={() => setEditingProject(null)}
                                                onSubmit={handleUpdate}
                                                title={editTitle}
                                                setTitle={setEditTitle}
                                                description={editDescription}
                                                setDescription={setEditDescription}
                                            />
                                        </div>
                                    ) : (
                                        <div className="group  md:py-5 bg-slate-200  transition duration-500 rounded-2xl flex items-center gap-x-5 cursor-default p-10">
                                            <div className="relative h-10 w-10">
                                                <img
                                                    className="absolute inset-0 h-full w-full object-contain"
                                                    src={ProjectIcon}
                                                    alt="Folder"
                                                />
                                            </div>

                                            <div className="flex flex-col md:flex-row w-full md:items-center items-start justify-between">
                                                <div
                                                    onClick={() => navigate(`/project/${project._id}`)}
                                                    className="mb-2 md:mb-0 cursor-pointer"
                                                >
                                                    <h1 className="font-head">{project.title}</h1>
                                                    <h1 className="font-med font-thin text-sm">{project.description}</h1>
                                                </div>

                                                <div className="flex gap-5 items-center text-sm font-helvetica">
                                                    <div
                                                        className="flex gap-1 items-center cursor-pointer"
                                                        onClick={() => handleEditClick(project)}
                                                    >
                                                        <div className="relative h-4 w-4 md:h-5 md:w-5">
                                                            <img
                                                                className="absolute inset-0 h-full w-full object-contain"
                                                                src={EditIcon}
                                                                alt="Edit"
                                                            />
                                                        </div>
                                                        <h1>Edit</h1>
                                                    </div>

                                                    <div
                                                        className="flex gap-1 items-center cursor-pointer"
                                                        onClick={() => confirmProjectDelete(project._id)}
                                                    >
                                                        <div className="relative h-4 w-4 md:h-5 md:w-5">
                                                            <img
                                                                className="absolute inset-0 h-full w-full object-contain"
                                                                src={DeleteIconB}
                                                                alt="Delete"
                                                            />
                                                        </div>
                                                        <h1>Delete</h1>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            {showPopup && (
                <ConfirmPopup
                    isOpen={showPopup}
                    message={popupMessage}
                    onConfirm={onConfirmCallback}
                    onCancel={cancelPopup}
                />
            )}
            {alert.show && (
                <CustomAlert
                    message={alert.message}
                    type={alert.type}
                    onClose={() => setAlert({ ...alert, show: false })}
                />
            )}
        </div>

    );
}
