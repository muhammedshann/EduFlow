import React, { useEffect, useState } from "react";
import { Users, Search, Ban, Crown, X } from "lucide-react";
import { CreateUser, DeleteUser, EditUser, GetUsers } from "../../Redux/AdminRedux/AdminUserSlice";
import { useDispatch } from "react-redux";
import { showNotification } from "../../Redux/NotificationSlice";

// --- Custom Component Mocks ---

// This component must be defined in the same file as UserManagement
const UserFormModal = ({ user, isOpen, onClose }) => {
    const dispatch = useDispatch();
    const isEditing = !!user;

    // --- STATE INITIALIZATION ---
    const [formData, setFormData] = useState({
        firstname: user?.firstname || (user?.name?.split(' ')[0] || ''),
        lastname: user?.lastname || (user?.name?.split(' ').slice(1).join(' ') || ''),
        username: user?.username || '',
        email: user?.email || '',
        status: user?.status || 'active',
        is_superuser: user?.is_superuser || false,
    });

    // Handle input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    useEffect(() => {
        if (user) {
            setFormData({
                firstname: user.firstname || (user.name?.split(' ')[0] || ''),
                lastname: user.lastname || (user.name?.split(' ').slice(1).join(' ') || ''),
                username: user.username || '',
                email: user.email || '',
                password: "",
                status: user.status || 'active',
                is_superuser: user.is_superuser || false,
            });
        } else if (isOpen) {
            setFormData({
                firstname: '', lastname: '', username: '', email: '', password: '', status: 'active', is_superuser: false
            });
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.username.includes(" ")) {
            dispatch(showNotification({
                message: "Username cannot contain spaces",
                type: "error"
            }));
            return;
        }
        const apiData = {
            id: user?.id,
            first_name: formData.firstname,
            last_name: formData.lastname,
            username: formData.username,
            email: formData.email,
            is_active: formData.status === 'active',
            is_superuser: formData.is_superuser,
        };

        if (isEditing) {
            await dispatch(EditUser(apiData)).unwrap()
        } else {
            apiData.password = formData.password
            await dispatch(CreateUser(apiData));
        }

        onClose();
    };

    const title = isEditing ? `Edit ${formData.firstname} ${formData.lastname}`.trim() : 'Add New User';
    const readOnly = false;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-2xl p-8 relative bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-2xl rounded-2xl animate-in zoom-in duration-200 transition-colors">

                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-slate-700 pb-3">
                    <h2 className="text-2xl font-light text-gray-800 dark:text-white tracking-tight">{title}</h2>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="p-1 rounded-full text-gray-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Column 1 */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1 uppercase">First Name</label>
                                <Input name="firstname" value={formData.firstname} onChange={handleChange} required disabled={readOnly} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1 uppercase">Last Name</label>
                                <Input name="lastname" value={formData.lastname} onChange={handleChange} required disabled={readOnly} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1 uppercase">Username</label>
                                <Input name="username" value={formData.username} onChange={handleChange} required disabled={readOnly} />
                            </div>
                        </div>

                        {/* Column 2 */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1 uppercase">Email Address</label>
                                <Input name="email" type="email" value={formData.email} onChange={handleChange} required disabled={readOnly} />
                            </div>
                            {!isEditing && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1 uppercase">Password</label>
                                    <Input name="password" value={formData.password} onChange={handleChange} required disabled={readOnly} />
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1 uppercase">Account Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-sm focus:ring-purple-500 dark:text-white outline-none transition-colors"
                                    disabled={readOnly}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Admin Status */}
                    <div className="mt-4 flex justify-between items-center p-3 bg-gray-100 dark:bg-slate-700 rounded-lg transition-colors">
                        <span className="text-gray-700 dark:text-slate-200 text-sm font-medium">Grant Admin / Superuser Access</span>
                        <input
                            type="checkbox"
                            name="is_superuser"
                            checked={formData.is_superuser}
                            onChange={handleChange}
                            className="h-5 w-5 accent-purple-600 rounded cursor-pointer"
                        />
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex justify-end pt-4 space-x-3 border-t border-gray-100 dark:border-slate-700">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        {!readOnly && (
                            <Button type="submit" variant="default">
                                {isEditing ? 'Save Changes' : 'Create User'}
                            </Button>
                        )}
                    </div>
                </form>
            </Card>
        </div>
    );
};

const Card = ({ children, className }) => (
    <div className={`rounded-xl bg-white dark:bg-slate-800 shadow-lg border border-gray-200 dark:border-slate-700 transition-colors duration-300 ${className}`}>{children}</div>
);

const Button = ({ children, onClick, variant = "default", className }) => {
    const base =
        variant === "default"
            ? "bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500"
            : variant === "outline"
                ? "border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                : variant === "ghost"
                    ? "hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300"
                    : "";

    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-lg text-sm transition-colors font-medium ${base} ${className}`}
        >
            {children}
        </button>
    );
};

const Input = ({ ...props }) => (
    <input
        {...props}
        className={`p-2 border border-gray-300 dark:border-slate-600 rounded-lg w-full bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 outline-none transition-colors ${props.className}`}
    />
);

const Badge = ({ children, className }) => (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${className}`}>{children}</span>
);

export const AdminStatCard = ({ title, value, change, icon: Icon, iconBg, iconColor, valueColor }) => (
    <div className="rounded-xl bg-white dark:bg-slate-800 p-6 border border-gray-100 dark:border-slate-700 shadow-sm transition-colors duration-300">
        <div className="flex items-center justify-between">
            <div className="flex flex-col justify-center gap-1">
                <div className={`text-3xl font-bold leading-tight text-gray-800 dark:text-white`}>
                    {value}
                </div>
                <div className="text-sm text-gray-500 dark:text-slate-400 font-medium leading-tight">
                    {title}
                </div>
            </div>

            <div className={`flex items-center justify-center h-12 w-12 rounded-xl ${iconBg} dark:bg-opacity-20`}>
                <Icon className={`h-6 w-6 ${iconColor}`} />
            </div>
        </div>
    </div>
);

// --- Main Component ---

export default function UserManagement() {
    const dispatch = useDispatch();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // modal
    const [selectedUser, setSelectedUser] = useState(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);

    const handleOpenForm = (user = null) => {
        setSelectedUser(user);
        setIsFormModalOpen(true);
    };

    const handleCloseModal = async () => {
        setIsFormModalOpen(false);
        setSelectedUser(null);
        await fetchUsers();
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const result = await dispatch(GetUsers()).unwrap();
            setUsers(result);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers()
    }, [])

    const cleanUsers = users.map((u) => {
        const role = u.is_superuser ? "Admin" : "User";
        const status = u.is_active ? "active" : "inactive";
        const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim();

        return {
            id: u.id,
            name: fullName || u.username || 'N/A',
            email: u.email || 'N/A',
            username: u.username || 'N/A',
            role: role,
            status: status,
            lastLogin: u.last_login
                ? new Date(u.last_login).toISOString().slice(0, 16).replace("T", " ")
                : "—",
            profilePic: u.profile_pic || null, 
        };
    });

    const filteredUsers = cleanUsers
        .filter((u) =>
            (u.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.email ?? '').toLowerCase().includes(searchTerm.toLowerCase())
        )
        .filter((u) => (statusFilter === "all" ? true : u.status === statusFilter));

    const getPlanBadgeColor = (role) => {
        switch (role) {
            case "Admin": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
            case "User": return "bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300";
            default: return "bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300";
        }
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case "active": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            case "inactive": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
            default: return "bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300";
        }
    };

    const HandleDelete = async (user) => {
        try {
            await dispatch(DeleteUser(user))
            await fetchUsers()
        } catch (err) {
            console.log(err)
        }
    }

    const totalUsers = cleanUsers.length;
    const activeUsers = cleanUsers.filter(u => u.status === "active").length;
    const inactiveUsers = cleanUsers.filter(u => u.status === "inactive").length;
    const superUsers = cleanUsers.filter(u => u.role === "Admin").length;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6 transition-colors duration-300">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">User Management</h1>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Monitor Users, Actions,</p>
                </div>
                {/* Create Button aligned to the right */}
                <Button 
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md dark:shadow-none" 
                    onClick={() => handleOpenForm(null)}
                >
                    Add User
                </Button>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <AdminStatCard title="Total Users" value={totalUsers} icon={Users} iconBg="bg-purple-100 dark:bg-purple-900/20" iconColor="text-purple-700 dark:text-purple-400" />
                <AdminStatCard title="Active Users" value={activeUsers} icon={Users} iconBg="bg-green-100 dark:bg-green-900/20" iconColor="text-green-600 dark:text-green-400" />
                <AdminStatCard title="Inactive Users" value={inactiveUsers} icon={Ban} iconBg="bg-yellow-100 dark:bg-yellow-900/20" iconColor="text-yellow-700 dark:text-yellow-400" />
                <AdminStatCard title="Admin Accounts" value={superUsers} icon={Crown} iconBg="bg-blue-100 dark:bg-blue-900/20" iconColor="text-blue-700 dark:text-blue-400" />
            </div>

            {/* SEARCH + FILTER */}
            <Card className="p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
                        <Input
                            placeholder="Search users by name or email..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                        {["all", "active", "inactive"].map((status) => (
                            <Button
                                key={status}
                                variant={statusFilter === status ? "default" : "outline"}
                                onClick={() => setStatusFilter(status)}
                                className={`capitalize rounded-full px-4 py-1 whitespace-nowrap`}
                            >
                                {status}
                            </Button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* USER LIST TABLE */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-700/50">
                            <tr>
                                {["User", "Role", "Status", "Username", "Last Login", "Actions"].map(
                                    (head) => (
                                        <th key={head} className="text-left p-4 text-sm font-semibold text-gray-600 dark:text-slate-400 whitespace-nowrap">
                                            {head}
                                        </th>
                                    )
                                )}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {loading ? (
                                <tr><td colSpan="7" className="p-6 text-center text-gray-500 dark:text-slate-400">Loading users...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan="7" className="p-6 text-center text-gray-500 dark:text-slate-400">No users found.</td></tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 cursor-pointer bg-gray-200 dark:bg-slate-700">
                                                    {user.profilePic ? (
                                                        <img
                                                            src={user.profilePic.startsWith('http') ? user.profilePic : `http://localhost:8000${user.profilePic}`}
                                                            alt={`${user.name} profile`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center justify-center text-white dark:text-slate-300 text-xs font-semibold w-full h-full bg-gray-500 dark:bg-slate-600">
                                                            {(user.name || user.username || '').charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-800 dark:text-slate-200">{user.name}</div>
                                                    <div className="text-sm text-gray-500 dark:text-slate-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 whitespace-nowrap"><Badge className={getPlanBadgeColor(user.role)}>{user.role}</Badge></td>
                                        <td className="p-4 whitespace-nowrap"><Badge className={getStatusBadgeColor(user.status)}>{user.status}</Badge></td>
                                        <td className="p-4 whitespace-nowrap text-gray-700 dark:text-slate-300">{user.username}</td>
                                        <td className="p-4 whitespace-nowrap"><div className="text-sm text-gray-500 dark:text-slate-500">{user.lastLogin}</div></td>
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" className="p-1 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20" onClick={() => handleOpenForm(user)}>Edit</Button>
                                                <Button variant="ghost" className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => HandleDelete(user)}>Delete</Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
            <UserFormModal user={selectedUser} isOpen={isFormModalOpen} onClose={handleCloseModal} />
        </div>
    );
}