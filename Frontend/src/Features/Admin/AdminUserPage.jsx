import React, { useEffect, useState } from "react";
import { Users, Search, MoreHorizontal, Ban, Crown, BarChart2, X } from "lucide-react";
import { CreateUser, DeleteUser, EditUser, GetUsers } from "../../Redux/AdminRedux/AdminUserSlice";
import { useDispatch } from "react-redux";
import { showNotification } from "../../Redux/NotificationSlice";

// --- Custom Component Mocks ---

// This component must be defined in the same file as UserManagement
const UserFormModal = ({ user, isOpen, onClose }) => {
    const dispatch = useDispatch();
    const isEditing = !!user;

    // --- STATE INITIALIZATION ---
    // We base the state on the comprehensive fields needed by the API.
    const [formData, setFormData] = useState({
        firstname: user?.firstname || (user?.name?.split(' ')[0] || ''),
        lastname: user?.lastname || (user?.name?.split(' ').slice(1).join(' ') || ''),
        username: user?.username || '',
        email: user?.email || '',
        status: user?.status || 'active', // e.g., 'active', 'suspended', 'inactive'
        is_superuser: user?.is_superuser || false, // Boolean for admin access
    });

    // Handle input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // Reset state when the modal opens/changes user
    useEffect(() => {
        if (user) {
            // When editing, initialize form with cleaned data
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
            // Reset to default empty state for adding
            setFormData({
                firstname: '', lastname: '', username: '', email: '', password: '', status: 'active', is_superuser: false
            });
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    // Submission handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Final data structured for API (using first_name, last_name, is_active, is_superuser)
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

        // --- ACTION PLACEHOLDERS ---
        if (isEditing) {
            const result = await dispatch(EditUser(apiData)).unwrap()
        } else {
            apiData.password = formData.password
            console.log(apiData, '-----------------');

            const result = await dispatch(CreateUser(apiData));
        }
        // --- END ACTION PLACEHOLDERS ---

        onClose();
    };

    const title = isEditing ? `Edit ${formData.firstname} ${formData.lastname}`.trim() : 'Add New User';
    const readOnly = false;

    return (
        // --- IMPROVED MODAL OVERLAY (Wider, blurred background) ---
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm">
            <Card className="w-full max-w-2xl p-8 relative bg-white border border-gray-100 shadow-2xl rounded-2xl">

                {/* Header (Minimalist) */}
                <div className="flex justify-between items-center mb-6 border-b pb-3">
                    <h2 className="text-2xl font-light text-gray-800 tracking-tight">{title}</h2>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="p-1 rounded-full text-gray-500 hover:text-purple-600"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Form - Uses two-column grid for better spacing */}
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* INPUTS GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                        {/* Column 1 */}
                        <div className="space-y-6">
                            {/* First Name */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">First Name</label>
                                <Input
                                    name="firstname"
                                    value={formData.firstname}
                                    onChange={handleChange}
                                    required
                                    disabled={readOnly}
                                />
                            </div>

                            {/* Last Name */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Last Name</label>
                                <Input
                                    name="lastname"
                                    value={formData.lastname}
                                    onChange={handleChange}
                                    required
                                    disabled={readOnly}
                                />
                            </div>

                            {/* Username */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Username</label>
                                <Input
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    disabled={readOnly}
                                />
                            </div>
                        </div>

                        {/* Column 2 */}
                        <div className="space-y-6">
                            {/* Email */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Email Address</label>
                                <Input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    disabled={readOnly}
                                />
                            </div>
                            {!isEditing && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">password</label>
                                    <Input
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        disabled={readOnly}
                                    />
                                </div>
                            )}

                            {/* Status (Active/Suspended/Inactive) */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Account Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm focus:ring-purple-500"
                                    disabled={readOnly}
                                >
                                    <option value="active">Active</option>
                                    {/* <option value="suspended">Suspended</option> */}
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Admin Status (Full Width Footer Control) */}
                    <div className="mt-4 flex justify-between items-center p-3 bg-gray-100 rounded-lg">
                        <span>Grant Admin / Superuser Access</span>
                        <input
                            type="checkbox"
                            name="is_superuser"
                            checked={formData.is_superuser}
                            onChange={handleChange}
                            className="h-5 w-5"
                        />
                    </div>


                    {/* Footer Buttons */}
                    <div className="flex justify-end pt-4 space-x-3 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
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
    <div className={`rounded-xl bg-white shadow-lg border border-gray-200 ${className}`}>{children}</div>
);

const Button = ({ children, onClick, variant = "default", className }) => {
    const base =
        variant === "default"
            ? "bg-purple-600 text-white hover:bg-purple-700"
            : variant === "outline"
                ? "border border-gray-300 text-gray-700 hover:bg-gray-200"
                : variant === "ghost"
                    ? "hover:bg-gray-100 text-gray-700"
                    : "";

    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-lg text-sm transition font-medium ${base} ${className}`}
        >
            {children}
        </button>
    );
};

const Input = ({ ...props }) => (
    <input
        {...props}
        className={`p-2 border border-gray-300 rounded-lg w-full focus:ring-purple-500 focus:border-purple-500 ${props.className}`}
    />
);

const Badge = ({ children, className }) => (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${className}`}>{children}</span>
);
// --- Stat Card Component for Dashboard UI ---

export const AdminStatCard = ({ title, value, change, icon: Icon, iconBg, iconColor, valueColor, changeColor }) => (
    <div className="rounded-xl bg-white p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between">
            <div className="flex flex-col justify-center gap-1">
                <div className={`text-3xl font-bold leading-tight ${valueColor}`}>
                    {value}
                </div>
                <div className="text-sm text-gray-500 font-medium leading-tight">
                    {title}
                </div>
                {change && (
                    <div className={`text-xs font-medium ${changeColor}`}>
                        {change}
                    </div>
                )}
            </div>

            <div className={`flex items-center justify-center h-12 w-12 rounded-xl ${iconBg}`}>
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
        console.log('s9nsdie of close modal ');

    };

    // Removed getAvatarColorClass as it's not needed for the requested default avatar

    // Fetch users on load
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

    // useEffect(() => {
    //     const fetchUsers = async () => {
    //         setLoading(true);
    //         try {
    //             const result = await dispatch(GetUsers()).unwrap();
    //             setUsers(result);
    //         } catch (error) {
    //             console.error("Failed to fetch users:", error);
    //             setUsers([]); // Ensure users array is empty on error
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //     fetchUsers();
    // }, [dispatch]);

    // Convert API response into your table-friendly format
    const cleanUsers = users.map((u) => {
        // Dynamic properties based on API data
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

            profilePic: u.profile_pic || null, // API should provide a path/URL
        };
    });

    // FILTER LOGIC
    const filteredUsers = cleanUsers
        .filter((u) =>
            (u.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.email ?? '').toLowerCase().includes(searchTerm.toLowerCase())
        )
        .filter((u) => (statusFilter === "all" ? true : u.status === statusFilter));

    const getPlanBadgeColor = (role) => {
        switch (role) {
            case "Admin": return "bg-purple-100 text-purple-800";
            case "User": return "bg-gray-100 text-gray-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case "active": return "bg-green-100 text-green-800";
            case "suspended": return "bg-red-100 text-red-800";
            case "inactive": return "bg-yellow-100 text-yellow-800";
            default: return "bg-gray-100 text-gray-800";
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

    // === REAL STATS CALCULATIONS ===
    const totalUsers = cleanUsers.length;

    const activeUsers = cleanUsers.filter(u => u.status === "active").length;

    const inactiveUsers = cleanUsers.filter(u => u.status === "inactive").length;

    const superUsers = cleanUsers.filter(u => u.role === "Enterprise").length;


    // --- Render ---

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
                    <p className="text-sm text-gray-500">Monitor Users, Actions,</p>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => handleOpenForm(null)}>Add user</Button>
            </div>

            {/* --- STATS CARDS (Hardcoded values maintained for dashboard look) --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <AdminStatCard
                    title="Total Users"
                    value={totalUsers}
                    icon={Users}
                    iconBg="bg-purple-100"
                    iconColor="text-purple-700"
                    valueColor="text-gray-800"
                />

                <AdminStatCard
                    title="Active Users"
                    value={activeUsers}
                    icon={Users}
                    iconBg="bg-green-100"
                    iconColor="text-green-600"
                    valueColor="text-gray-800"
                />

                <AdminStatCard
                    title="Inactive Users"
                    value={inactiveUsers}
                    icon={Ban}
                    iconBg="bg-yellow-100"
                    iconColor="text-yellow-700"
                    valueColor="text-gray-800"
                />

                <AdminStatCard
                    title="Admin Accounts"
                    value={superUsers}
                    icon={Crown}
                    iconBg="bg-blue-100"
                    iconColor="text-blue-700"
                    valueColor="text-gray-800"
                />
            </div>

            {/* SEARCH + FILTER */}
            <Card className="p-4 mb-6">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search users by name or email..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex gap-2">
                        {["all", "active", "suspended", "inactive"].map((status) => (
                            <Button
                                key={status}
                                variant={statusFilter === status ? "default" : "outline"}
                                onClick={() => setStatusFilter(status)}
                                className={`capitalize rounded-full px-4 py-1`}
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
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {["User", "role", "Status", "username", "Last Login", "Actions"].map(
                                    (head) => (
                                        <th
                                            key={head}
                                            className="text-left p-4 text-sm font-semibold text-gray-600 whitespace-nowrap"
                                        >
                                            {head}
                                        </th>
                                    )
                                )}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="p-6 text-center text-gray-500">Loading users...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-6 text-center text-gray-500">
                                        {users.length === 0 && searchTerm === "" ? (
                                            "No users found in the system."
                                        ) : (
                                            "No users matched your current filters/search criteria."
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        {/* USER */}
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 cursor-pointer"
                                                >
                                                    {/* Profile Picture / Initials Fallback */}
                                                    {user.profilePic ? (
                                                        <img
                                                            // Corrected to use user.profilePic directly if it's a full URL, 
                                                            // or assume it's an absolute path that needs the origin.
                                                            src={user.profilePic.startsWith('http') ? user.profilePic : `http://localhost:8000${user.profilePic}`}
                                                            alt={`${user.name} profile`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        // Fallback to plain gray initials
                                                        <div className={`flex items-center justify-center text-white text-xs font-semibold w-full h-full bg-gray-500`}>
                                                            {
                                                                (user.name || '')
                                                                    .split(' ')
                                                                    .map(n => n.charAt(0))
                                                                    .join('')
                                                                    .toUpperCase()
                                                                ||
                                                                (user.username || '').charAt(0).toUpperCase()
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-800">{user.name}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* PLAN */}
                                        <td className="p-4 whitespace-nowrap">
                                            <Badge className={getPlanBadgeColor(user.role)}>{user.role}</Badge>
                                        </td>

                                        {/* STATUS */}
                                        <td className="p-4 whitespace-nowrap">
                                            <Badge className={getStatusBadgeColor(user.status)}>{user.status}</Badge>
                                        </td>

                                        {/* USERNAME */}
                                        <td className="p-4 whitespace-nowrap">{user.username}</td>

                                        {/* LAST LOGIN */}
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{user.lastLogin}</div>
                                        </td>

                                        {/* ACTIONS */}
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Button variant="ghost" className="p-1 text-purple-600" onClick={() => handleOpenForm(user)}>
                                                    Edit
                                                </Button>
                                                <Button variant="ghost" className="p-1 text-red-600" onClick={() => HandleDelete(user)}>
                                                    delete
                                                </Button>

                                            </div>
                                        </td>

                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
            <UserFormModal
                user={selectedUser}
                isOpen={isFormModalOpen}
                onClose={handleCloseModal}
            />
        </div>
    );
}