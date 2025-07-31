import { useEffect, useRef, useState } from 'react'
import {
    FaBirthdayCake,
    FaCalendarAlt,
    FaCamera,
    FaCheckCircle,
    FaEdit,
    FaEnvelope,
    FaExclamationCircle,
    FaMapMarkerAlt,
    FaPhone,
    FaSave,
    FaShieldAlt,
    FaTimes,
    FaUser,
    FaUserCheck,
    FaUsers
} from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { clearAuthError, getProfileData, updateProfileAction } from '../../../redux/features/auth/authSlice'

const ProfileInformation = () => {
    const { loading, error, isError, isLoading, user } = useSelector((state) => state.auth)
    const dispatch = useDispatch()
    const fileInputRef = useRef(null)

    // Edit mode state
    const [isEditing, setIsEditing] = useState(false)
    const [editData, setEditData] = useState({
        name: '',
        address: '',
        gender: '',
        dob: ''
    })
    const [editErrors, setEditErrors] = useState({})


    // Avatar state
    const [avatar, setAvatar] = useState(null)
    const [avatarPreview, setAvatarPreview] = useState('')


    // Initialize edit data when user data is available
    useEffect(() => {
        if (user) {
            setEditData({
                name: user.name || '',
                address: user.address || '',
                gender: user.gender || '',
                dob: user.dob ? user.dob.split('T')[0] : '' // Format date for input
            })
            setAvatarPreview(user.avatar?.url || '')
        }
    }, [user])

    useEffect(() => {
        if (error) {
            toast.error(error)
            dispatch(clearAuthError())
        }
    }, [dispatch, error])
    useEffect(() => {
        if (isError) {
            toast.error(isError)
            dispatch(clearAuthError())
        }
    }, [dispatch, isError])

    useEffect(() => {
        dispatch(getProfileData())
    }, [dispatch])

    // Handle avatar file selection
    const handleAvatarChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
            if (!allowedTypes.includes(file.type)) {
                toast.error('Please select a valid image file (JPEG, PNG, WebP)')
                return
            }

            // Validate file size (5MB limit)
            const maxSize = 5 * 1024 * 1024 // 5MB
            if (file.size > maxSize) {
                toast.error('Image size should be less than 5MB')
                return
            }

            setAvatar(file)

            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setAvatarPreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    // Validation function
    const validateForm = () => {
        const errors = {}

        // Name validation
        if (!editData.name.trim()) {
            errors.name = 'Name is required'
        } else if (editData.name.trim().length < 2) {
            errors.name = 'Name must be at least 2 characters'
        } else if (editData.name.trim().length > 50) {
            errors.name = 'Name must be less than 50 characters'
        } else if (!/^[a-zA-Z\s]+$/.test(editData.name.trim())) {
            errors.name = 'Name can only contain letters and spaces'
        }

        // Address validation
        if (editData.address && editData.address.trim().length > 200) {
            errors.address = 'Address must be less than 200 characters'
        }

        // Gender validation
        if (!editData.gender) {
            errors.gender = 'Please select a gender'
        }

        // Date of birth validation
        if (editData.dob) {
            const dobDate = new Date(editData.dob)
            const today = new Date()
            const age = today.getFullYear() - dobDate.getFullYear()

            if (dobDate > today) {
                errors.dob = 'Date of birth cannot be in the future'
            } else if (age > 120) {
                errors.dob = 'Please enter a valid date of birth'
            } else if (age < 13) {
                errors.dob = 'You must be at least 13 years old'
            }
        }

        setEditErrors(errors)
        return Object.keys(errors).length === 0
    }

    // Handle input changes
    const handleInputChange = (field, value) => {
        setEditData(prev => ({
            ...prev,
            [field]: value
        }))

        // Clear specific field error when user starts typing
        if (editErrors[field]) {
            setEditErrors(prev => ({
                ...prev,
                [field]: ''
            }))
        }
    }

    // Handle save
    const handleSave = async () => {
        if (!validateForm()) {
            toast.error('Please correct the errors before saving')
            return
        }

        try {
            // Create FormData for multipart upload
            const formData = new FormData()

            // Add text fields
            formData.append('name', editData.name.trim())
            formData.append('address', editData.address.trim())
            formData.append('gender', editData.gender)
            if (editData.dob) {
                formData.append('dob', editData.dob)
            }

            // Add avatar file if selected
            if (avatar) {
                formData.append('avatar', avatar)
            }

            // Dispatch update action
            await dispatch(updateProfileAction({ formData, toast })).unwrap()


            setAvatar(null)


            // Refresh profile data
            dispatch(getProfileData())
        } catch (error) {
            console.log(error)
        }
    }

    // Handle cancel
    const handleCancel = () => {
        setIsEditing(false)



    }

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'Not provided'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    // Calculate age
    const calculateAge = (dobString) => {
        if (!dobString) return null
        const dob = new Date(dobString)
        const today = new Date()
        const age = today.getFullYear() - dob.getFullYear()
        const monthDiff = today.getMonth() - dob.getMonth()

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            return age - 1
        }
        return age
    }

    // Get account status
    const getAccountStatus = () => {
        if (user?.verified && user?.isActive) {
            return { text: 'Active & Verified', color: 'text-green-600', icon: FaCheckCircle }
        } else if (user?.verified) {
            return { text: 'Verified', color: 'text-blue-600', icon: FaUserCheck }
        } else {
            return { text: 'Pending Verification', color: 'text-yellow-600', icon: FaExclamationCircle }
        }
    }

    if (loading && !user) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <FaExclamationCircle className="text-4xl text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600">Unable to load profile information</p>
                </div>
            </div>
        )
    }

    const accountStatus = getAccountStatus()
    const StatusIcon = accountStatus.icon
    const userAge = calculateAge(user.dob)

    return (
        <div className="max-w-4xl min-h-screen mx-auto p-6 bg-white rounded-lg shadow-lg py-36">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        {/* Avatar Display */}
                        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-blue-200">
                            {avatarPreview ? (
                                <img
                                    src={avatarPreview}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                    <FaUser className="text-2xl text-white" />
                                </div>
                            )}
                        </div>

                        {/* Avatar Upload Button */}
                        {isEditing && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                            >

                                <FaCamera className="text-xs" />

                            </button>
                        )}

                        {/* Hidden File Input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                        />
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
                        <div className="flex items-center space-x-2 mt-1">
                            <StatusIcon className={`text-sm ${accountStatus.color}`} />
                            <span className={`text-sm font-medium ${accountStatus.color}`}>
                                {accountStatus.text}
                            </span>
                        </div>
                        {userAge && (
                            <p className="text-sm text-gray-600 mt-1">{userAge} years old</p>
                        )}
                    </div>
                </div>

                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <FaEdit />
                        <span>Edit Profile</span>
                    </button>
                ) : (
                    <div className="flex space-x-2">
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            <FaSave />
                            <span>{isLoading ? 'Saving...' : 'Save'}</span>
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={isLoading}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <FaTimes />
                            <span>Cancel</span>
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                        Personal Information
                    </h2>

                    {/* Name */}
                    <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                            <FaUser className="text-blue-600" />
                            <span>Full Name</span>
                        </label>
                        {isEditing ? (
                            <div>
                                <input
                                    type="text"
                                    value={editData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter your full name"
                                />
                                {editErrors.name && (
                                    <p className="text-red-500 text-sm mt-1">{editErrors.name}</p>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-800 bg-gray-50 px-4 py-3 rounded-lg">{user.name}</p>
                        )}
                    </div>

                    {/* Email (Read-only) */}
                    <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                            <FaEnvelope className="text-blue-600" />
                            <span>Email Address</span>
                            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">Read-only</span>
                        </label>
                        <p className="text-gray-800 bg-gray-50 px-4 py-3 rounded-lg flex items-center justify-between">
                            {user.email}
                            {user.verified && (
                                <FaCheckCircle className="text-green-600" title="Verified Email" />
                            )}
                        </p>
                    </div>

                    {/* Mobile Number (Read-only) */}
                    <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                            <FaPhone className="text-blue-600" />
                            <span>Mobile Number</span>
                            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">Read-only</span>
                        </label>
                        <p className="text-gray-800 bg-gray-50 px-4 py-3 rounded-lg">
                            +977 {user.mobile_No || 'Not provided'}
                        </p>
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                            <FaMapMarkerAlt className="text-blue-600" />
                            <span>Address</span>
                        </label>
                        {isEditing ? (
                            <div>
                                <textarea
                                    value={editData.address}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter your address"
                                    rows="3"
                                    maxLength="200"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>{editErrors.address && <span className="text-red-500">{editErrors.address}</span>}</span>
                                    <span>{editData.address.length}/200</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-800 bg-gray-50 px-4 py-3 rounded-lg">
                                {user.address || 'Not provided'}
                            </p>
                        )}
                    </div>

                    {/* Gender */}
                    <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                            <FaUser className="text-blue-600" />
                            <span>Gender</span>
                        </label>
                        {isEditing ? (
                            <div>
                                <select
                                    value={editData.gender}
                                    onChange={(e) => handleInputChange('gender', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                                {editErrors.gender && (
                                    <p className="text-red-500 text-sm mt-1">{editErrors.gender}</p>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-800 bg-gray-50 px-4 py-3 rounded-lg">
                                {user.gender || 'Not provided'}
                            </p>
                        )}
                    </div>

                    {/* Date of Birth */}
                    <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                            <FaBirthdayCake className="text-blue-600" />
                            <span>Date of Birth</span>
                        </label>
                        {isEditing ? (
                            <div>
                                <input
                                    type="date"
                                    value={editData.dob}
                                    onChange={(e) => handleInputChange('dob', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    max={new Date().toISOString().split('T')[0]}
                                />
                                {editErrors.dob && (
                                    <p className="text-red-500 text-sm mt-1">{editErrors.dob}</p>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-800 bg-gray-50 px-4 py-3 rounded-lg">
                                {formatDate(user.dob)}
                                {userAge && <span className="text-gray-600 ml-2">({userAge} years old)</span>}
                            </p>
                        )}
                    </div>
                </div>

                {/* Account Information */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                        Account Information
                    </h2>

                    {/* Account Status */}
                    <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                            <FaShieldAlt className="text-blue-600" />
                            <span>Account Status</span>
                        </label>
                        <div className="bg-gray-50 px-4 py-3 rounded-lg">
                            <div className="flex items-center justify-between">
                                <span className={`font-medium ${accountStatus.color}`}>
                                    {accountStatus.text}
                                </span>
                                <StatusIcon className={`text-lg ${accountStatus.color}`} />
                            </div>
                            <div className="text-sm text-gray-600 mt-2">
                                <p>Role: <span className="font-medium">{user.role}</span></p>
                                <p>Login Attempts: <span className="font-medium">{user.loginAttempts}</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Account Dates */}
                    <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                            <FaCalendarAlt className="text-blue-600" />
                            <span>Account Timeline</span>
                        </label>
                        <div className="bg-gray-50 px-4 py-3 rounded-lg space-y-2">
                            <p className="text-sm">
                                <span className="font-medium">Created:</span> {formatDate(user.createdAt)}
                            </p>
                            <p className="text-sm">
                                <span className="font-medium">Last Updated:</span> {formatDate(user.updatedAt)}
                            </p>
                        </div>
                    </div>

                    {/* Social Stats */}
                    <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                            <FaUsers className="text-blue-600" />
                            <span>Social Statistics</span>
                        </label>
                        <div className="bg-gray-50 px-4 py-3 rounded-lg">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-2xl font-bold text-blue-600">{user.posts?.length || 0}</p>
                                    <p className="text-xs text-gray-600">Posts</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-green-600">{user.followers?.length || 0}</p>
                                    <p className="text-xs text-gray-600">Followers</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-purple-600">{user.following?.length || 0}</p>
                                    <p className="text-xs text-gray-600">Following</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Information */}
                    <div className="space-y-2">
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                            <FaShieldAlt className="text-blue-600" />
                            <span>Security</span>
                        </label>
                        <div className="bg-gray-50 px-4 py-3 rounded-lg">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Two-Factor Auth:</span>
                                    <span className="text-yellow-600">Verified</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Account Lock:</span>
                                    <span className="text-green-600">
                                        {user.lockUntil ? 'Locked' : 'Active'}
                                    </span>
                                </div>
                            </div>
                            <button className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium">
                                Manage Security Settings
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfileInformation