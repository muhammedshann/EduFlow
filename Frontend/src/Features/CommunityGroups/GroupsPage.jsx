import React, { useEffect, useState } from "react";
import {
    Search,
    Users,
    MessageSquare,
    Plus,
    GraduationCap,
    Inbox,
    X
} from "lucide-react";
import { useDispatch } from "react-redux";
import { CreateGroup, FetchGroup, JoinGroup } from "../../Redux/GroupsSlice";
import { useNavigate } from "react-router-dom";

const GRADIENT_CLASS =
    "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700";
const SOFT_BG = "bg-purple-50";
const CARD_BG = "bg-white";
const BORDER_COLOR = "border-purple-100";

export const CreateGroupModal = ({ open, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        type: "public",
    });

    if (!open) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            alert("Group name is required.");
            return;
        }
        onSubmit(formData);
        setFormData({ name: "", description: "", type: "public", })
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 animate-fadeIn">

                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Create New Group</h2>
                    <button onClick={onClose} className="text-gray-600 hover:text-purple-600">
                        <X size={22} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Group Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Group Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full mt-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Enter group name"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full mt-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Describe the group"
                        />
                    </div>

                    {/* Type*/}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Group Type</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full mt-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                        >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                        </select>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className={`px-6 py-2 text-white font-semibold rounded-lg shadow-md ${GRADIENT_CLASS}`}
                        >
                            Create Group
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};


const EmptyState = ({ text }) => (
    <div className="w-full bg-white border border-gray-200 rounded-xl py-10 flex flex-col items-center justify-center text-center shadow-sm">
        <Inbox className="w-10 h-10 text-gray-400 mb-3" />
        <p className="text-gray-500 font-medium">{text}</p>
    </div>
);

const GroupCard = ({ id, name, members_count, description, type, actionText, isJoined, onAction }) => {
    const showChat = isJoined && actionText === "Open Chat";

    return (
        <div
            className={`${CARD_BG} p-6 rounded-xl shadow-md ${BORDER_COLOR} border transition-shadow hover:shadow-lg flex flex-col h-full relative`}
        >
            {type === "private" && (
                <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                        Private
                    </span>
                </div>
            )}

            <div className="flex items-start justify-between">
                <div className="flex items-start">
                    <div className="p-2 mr-3 rounded-md bg-purple-50 text-purple-600">
                        <GraduationCap className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
                </div>
            </div>

            <p className="text-gray-600 text-sm mt-3 flex-grow">{description}</p>

            <div className="mt-4 pt-4">
                {showChat ? (
                    <button
                        onClick={onAction}
                        className="w-full py-2 rounded-lg font-semibold bg-white text-purple-600 border border-purple-300 hover:bg-purple-50 transition flex items-center justify-center"
                    >
                        <MessageSquare className="w-5 h-5 mr-2" />
                        Open Chat
                    </button>
                ) : (
                    <button
                        onClick={onAction}
                        className={`w-full py-2 rounded-lg font-semibold text-white transition ${GRADIENT_CLASS} shadow-lg shadow-purple-300/50`}
                    >
                        Join
                    </button>
                )}
            </div>
        </div>
    );
};


const GroupsPage = () => {
    const [createdGroups, setCreatedGroups] = useState([]);
    const [joinedGroups, setJoinedGroups] = useState([]);
    const [publicGroups, setPublicGroups] = useState([]);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const dispatch = useDispatch();
    const fetchGroups = async () => {
        try {
            const res = await dispatch(FetchGroup()).unwrap();
            setCreatedGroups(res.created_groups);
            setJoinedGroups(res.joined_groups);
            setPublicGroups(res.public_groups);
        } catch (err) {
            console.error("Failed to fetch groups:", err);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const filteredCreated = createdGroups.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredJoined = joinedGroups.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredPublic = publicGroups.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateGroup = async (data) => {
        try {
            // setLoading(true);

            await dispatch(CreateGroup(data)).unwrap();

            await fetchGroups();
            setOpenCreateModal(false);
        } catch (err) {
            console.error("Create group failed:", err);
        }
    };

    return (
        <div className={`min-h-screen ${SOFT_BG}`}>
            <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 max-w-7xl">
                {/* Header */}
                <header className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold text-purple-800">
                        Study Groups & Community
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Connect with learners and collaborate on your studies
                    </p>
                </header>

                {/* Search + Create Group */}
                <div className="flex flex-col sm:flex-row gap-4 mb-10">
                    <div className="relative flex-grow">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search groups..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full py-3.5 pl-12 pr-4 border border-gray-200 rounded-xl shadow-sm focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>
                    <button
                        onClick={() => setOpenCreateModal(true)}
                        className={`flex items-center justify-center px-6 py-3.5 text-white font-semibold rounded-xl shadow-lg shadow-purple-300/50 ${GRADIENT_CLASS}`}
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Group
                    </button>
                </div>

                {/* CREATED GROUPS */}
                <section className="mb-10">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Created Groups</h2>

                    {filteredCreated.length === 0 ? (
                        <EmptyState text="You have not created any groups." />
                    ) : (
                        <div className="overflow-x-auto">
                            <div className="flex space-x-6 pb-2">
                                {filteredCreated.map((group) => (
                                    <div key={group.id} className="min-w-[300px] max-w-[320px] flex-shrink-0">
                                        <GroupCard
                                            {...group}
                                            actionText="Open Chat"
                                            isJoined={true}
                                            onAction={() => window.open(`/groups/chat/${group.id}/`, "_blank")}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>


                {/* JOINED GROUPS */}
                <section className="mb-10">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Joined Groups</h2>

                    {filteredJoined.length === 0 ? (
                        <EmptyState text="You haven't joined any groups yet." />
                    ) : (
                        <div className="overflow-x-auto">
                            <div className="flex space-x-6 pb-2">
                                {filteredJoined.map((group) => (
                                    <div key={group.id} className="min-w-[300px] max-w-[320px] flex-shrink-0">
                                        <GroupCard
                                            {...group}
                                            actionText="Open Chat"
                                            isJoined={true}
                                            onAction={() => window.open(`/groups/chat/${group.id}/`, "_blank")}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>


                {/* DISCOVER PUBLIC GROUPS */}
                <section className="mb-10">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Discover Groups</h2>

                    {filteredPublic.length === 0 ? (
                        <EmptyState text="No public groups available currently." />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredPublic.map((group) => (
                                <GroupCard
                                    key={group.id}
                                    {...group}
                                    actionText="Join"
                                    onAction={() => window.open(`/groups/chat/${group.id}/`, "_blank")}
                                />
                            ))}
                        </div>
                    )}
                </section>
                <CreateGroupModal
                    open={openCreateModal}
                    onClose={() => setOpenCreateModal(false)}
                    onSubmit={handleCreateGroup}
                />

            </div>
        </div>
    );
};

export default GroupsPage;
