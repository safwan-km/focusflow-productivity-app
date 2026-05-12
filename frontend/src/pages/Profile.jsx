import { useState, useEffect } from 'react'
import { useToast } from '../hooks/useToast'
import { ToastContainer } from '../components/Toast'
import { fetchProfile, updateProfile } from '../api'
import '../styles/Profile.css'

function Profile() {
  const [profile, setProfile]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [nameForm, setNameForm] = useState({ name: '' })
  const [emailForm, setEmailForm] = useState({ email: '' })
  const [passForm, setPassForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [nameError, setNameError]   = useState('')
  const [emailError, setEmailError] = useState('')
  const [passError, setPassError]   = useState('')
  const [saving, setSaving]         = useState('')
  const { toasts, showToast, removeToast } = useToast()

  useEffect(() => {
    fetchProfile()
      .then(data => {
        setProfile(data)
        setNameForm({ name: data.name || '' })
        setEmailForm({ email: data.email || '' })
        setLoading(false)
      })
      .catch(() => {
        showToast('Failed to load profile', 'error')
        setLoading(false)
      })
  }, [])

  const handleNameSave = async () => {
    setNameError('')
    setSaving('name')
    try {
      const updated = await updateProfile({ name: nameForm.name })
      setProfile(updated)
      localStorage.setItem('userEmail', updated.email)
      localStorage.setItem('userName', nameForm.name)
      showToast('Name updated successfully')
    } catch (err) {
      setNameError(err.response?.data?.detail || 'Failed to update name')
    } finally {
      setSaving('')
    }
  }

  const handleEmailSave = async () => {
    setEmailError('')
    if (!emailForm.email.trim()) {
      setEmailError('Email cannot be empty')
      return
    }
    setSaving('email')
    try {
      await updateProfile({ email: emailForm.email })
      localStorage.setItem('userEmail', emailForm.email)
      showToast('Email updated! Please login again with your new email.')
      setTimeout(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('userEmail')
        localStorage.removeItem('userName')
        window.location.href = '/login'
      }, 2000)
    } catch (err) {
      setEmailError(err.response?.data?.detail || 'Failed to update email')
    } finally {
      setSaving('')
    }
  }

  const handlePasswordSave = async () => {
    setPassError('')
    if (!passForm.current_password) {
      setPassError('Please enter your current password')
      return
    }
    if (!passForm.new_password) {
      setPassError('Please enter a new password')
      return
    }
    if (passForm.new_password.length < 6) {
      setPassError('New password must be at least 6 characters')
      return
    }
    if (passForm.new_password !== passForm.confirm_password) {
      setPassError('New passwords do not match')
      return
    }
    setSaving('password')
    try {
      await updateProfile({
        current_password: passForm.current_password,
        new_password:     passForm.new_password,
      })
      setPassForm({
        current_password: '',
        new_password:     '',
        confirm_password: '',
      })
      showToast('Password changed successfully')
    } catch (err) {
      setPassError(err.response?.data?.detail || 'Failed to change password')
    } finally {
      setSaving('')
    }
  }

  const getInitials = () => {
    if (profile?.name) return profile.name.slice(0, 2).toUpperCase()
    if (profile?.email) return profile.email.slice(0, 2).toUpperCase()
    return 'U'
  }

  const getDisplayName = () => {
    if (profile?.name) return profile.name
    if (profile?.email) return profile.email.split('@')[0]
    return 'User'
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="profile-page">
        <p style={{ color: '#8A9480' }}>Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="profile-header">
        <p className="profile-header__label">FocusFlow</p>
        <h1 className="profile-header__title">My Profile</h1>
      </div>

      <div className="profile-layout">

        {/* ── Left: Avatar Card ── */}
        <div className="profile-avatar-card">
          <div className="profile-avatar">{getInitials()}</div>
          <p className="profile-avatar-card__name">{getDisplayName()}</p>
          <p className="profile-avatar-card__email">{profile?.email}</p>
          <p className="profile-avatar-card__since">
            Member since {formatDate(profile?.created_at)}
          </p>
        </div>

        {/* ── Right: Form Cards ── */}
        <div>

          {/* Display Name */}
          <div className="profile-card">
            <h2 className="profile-card__title">Display Name</h2>
            {nameError && <p className="profile-error">{nameError}</p>}
            <div className="profile-field">
              <label className="profile-field__label">Name</label>
              <input
                className="profile-field__input"
                type="text"
                placeholder="Enter your name"
                value={nameForm.name}
                onChange={e => setNameForm({ name: e.target.value })}
              />
              <span className="profile-field__hint">
                This name will appear in the sidebar and dashboard
              </span>
            </div>
            <button
              className="profile-save-btn"
              onClick={handleNameSave}
              disabled={saving === 'name'}
            >
              {saving === 'name' ? 'Saving...' : 'Save Name'}
            </button>
          </div>

          {/* Email */}
          <div className="profile-card">
            <h2 className="profile-card__title">Email Address</h2>
            {emailError && <p className="profile-error">{emailError}</p>}
            <div className="profile-field">
              <label className="profile-field__label">Email</label>
              <input
                className="profile-field__input"
                type="email"
                value={emailForm.email}
                onChange={e => setEmailForm({ email: e.target.value })}
              />
            </div>
            <button
              className="profile-save-btn"
              onClick={handleEmailSave}
              disabled={saving === 'email'}
            >
              {saving === 'email' ? 'Saving...' : 'Save Email'}
            </button>
          </div>

          {/* Password */}
          <div className="profile-card">
            <h2 className="profile-card__title">Change Password</h2>
            {passError && <p className="profile-error">{passError}</p>}
            <div className="profile-field">
              <label className="profile-field__label">Current Password</label>
              <input
                className="profile-field__input"
                type="password"
                placeholder="Enter current password"
                value={passForm.current_password}
                onChange={e => setPassForm(p => ({ ...p, current_password: e.target.value }))}
              />
            </div>
            <div className="profile-field">
              <label className="profile-field__label">New Password</label>
              <input
                className="profile-field__input"
                type="password"
                placeholder="Min 6 characters"
                value={passForm.new_password}
                onChange={e => setPassForm(p => ({ ...p, new_password: e.target.value }))}
              />
            </div>
            <div className="profile-field">
              <label className="profile-field__label">Confirm New Password</label>
              <input
                className="profile-field__input"
                type="password"
                placeholder="Repeat new password"
                value={passForm.confirm_password}
                onChange={e => setPassForm(p => ({ ...p, confirm_password: e.target.value }))}
              />
            </div>
            <button
              className="profile-save-btn"
              onClick={handlePasswordSave}
              disabled={saving === 'password'}
            >
              {saving === 'password' ? 'Saving...' : 'Change Password'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Profile