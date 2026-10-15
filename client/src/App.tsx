import { useEffect, useState, type FormEvent } from 'react'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import AccountFlowIcon from '@mui/icons-material/AccountTreeRounded'
import AlternateEmailIcon from '@mui/icons-material/AlternateEmailRounded'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineRounded'
import VisibilityIcon from '@mui/icons-material/VisibilityRounded'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOffRounded'
import LogoutIcon from '@mui/icons-material/LogoutRounded'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded'
import InboxRoundedIcon from '@mui/icons-material/InboxRounded'
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded'
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded'
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded'
import './App.css'



const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:3000'
).replace(/\/+$/, '')

type User = {
  id: string
  name: string
  email: string
}

type ApiResponse = {
  success?: boolean
  message?: string
  user?: User
  data?: { user?: User }
}

function App() {
  const [activePage, setActivePage] = useState('Overview')
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true

    async function checkSession() {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          credentials: 'include',
        })

        if (!response.ok) return

        const result: ApiResponse = await response.json()
        const currentUser = result.user ?? result.data?.user

        if (active && currentUser) setUser(currentUser)
      } catch {
        if (active) {
          setError('Cannot reach the backend. Check that the server is running.')
        }
      } finally {
        if (active) setCheckingSession(false)
      }
    }

    void checkSession()

    return () => {
      active = false
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setNotice('')
    setLoading(true)

    try {
      const endpoint =
        mode === 'register' ? '/api/auth/register' : '/api/auth/login'

      const body =
        mode === 'register'
          ? { name: name.trim(), email: email.trim(), password }
          : { email: email.trim(), password }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const result: ApiResponse = await response.json()

      if (!response.ok || result.success === false) {
        throw new Error(result.message || 'Authentication failed.')
      }

      const authenticatedUser = result.user ?? result.data?.user

      if (authenticatedUser) {
        setUser(authenticatedUser)
        setPassword('')
      } else {
        setNotice(
          mode === 'register'
            ? 'Account created. Please sign in with your credentials.'
            : 'Request successful, but the server did not return a user profile.',
        )

        if (mode === 'register') {
          setMode('login')
          setPassword('')
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    setError('')
    setNotice('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })

      const result: ApiResponse = await response.json()

      if (!response.ok || result.success === false) {
        throw new Error(result.message || 'Unable to log out.')
      }

      setUser(null)
      setPassword('')
      setMode('login')
      setNotice('You have signed out successfully.')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to log out.',
      )
    } finally {
      setLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <Box className="loading-screen">
        <CircularProgress />
        <Typography>Connecting to FlowPilot...</Typography>
      </Box>
    )
  }

  if (user) {
    const navigation = [
      { label: 'Overview', icon: <DashboardRoundedIcon /> },
      { label: 'Workflows', icon: <AccountTreeRoundedIcon /> },
      { label: 'Requests', icon: <InboxRoundedIcon /> },
      { label: 'Approvals', icon: <TaskAltRoundedIcon /> },
    ]

    const workflows = [
      { name: 'Leave Request', category: 'Human Resources', status: 'Active', updated: 'Today' },
      { name: 'Expense Reimbursement', category: 'Finance', status: 'Active', updated: 'Yesterday' },
      { name: 'Purchase Approval', category: 'Operations', status: 'Draft', updated: 'Oct 14' },
      { name: 'Onboarding Process', category: 'Human Resources', status: 'Active', updated: 'Oct 12' },
    ]

    const activities = [
      { title: 'Leave Request', detail: 'Request submitted for review', time: '10 minutes ago' },
      { title: 'Expense Reimbursement', detail: 'Awaiting approval', time: '1 hour ago' },
      { title: 'Onboarding Process', detail: 'Workflow updated', time: 'Yesterday' },
    ]

    return (
      <Box className="app-shell">
        <Box component="aside" className="sidebar">
          <Box className="sidebar-brand">
            <Avatar className="brand-icon">
              <AccountFlowIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">FlowPilot</Typography>
              <Typography className="brand-caption">WORKFLOW PLATFORM</Typography>
            </Box>
          </Box>

          <Typography className="nav-caption">WORKSPACE</Typography>

          <Box className="nav-list">
            {navigation.map((item) => (
              <Button
                key={item.label}
                className={`nav-item ${activePage === item.label ? 'selected' : ''}`}
                startIcon={item.icon}
                onClick={() => setActivePage(item.label)}
                fullWidth
              >
                {item.label}
              </Button>
            ))}
          </Box>

          <Box className="sidebar-bottom">
            <Button
              className="nav-item"
              startIcon={<SettingsRoundedIcon />}
              onClick={() => setActivePage('Settings')}
              fullWidth
            >
              Settings
            </Button>

            <Divider sx={{ my: 2 }} />

            <Box className="sidebar-user">
              <Avatar className="user-avatar">
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography className="user-name">{user.name}</Typography>
                <Typography className="user-email">{user.email}</Typography>
              </Box>
              <IconButton
                size="small"
                aria-label="Sign out"
                onClick={handleLogout}
                disabled={loading}
              >
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>

        <Box component="main" className="main-panel">
          <Box component="header" className="dashboard-topbar">
            <Box className="breadcrumb">
              <Typography color="text.secondary">Workspace</Typography>
              <Typography color="text.secondary">/</Typography>
              <Typography sx={{ fontWeight: 600 }}>{activePage}</Typography>
            </Box>

            <Box className="topbar-actions">
              <TextField
                size="small"
                placeholder="Search workspace..."
                className="dashboard-search"
                slotProps={{
                  input: {
                    startAdornment: <SearchRoundedIcon fontSize="small" />,
                  },
                }}
              />
              <IconButton aria-label="Notifications">
                <NotificationsNoneRoundedIcon />
              </IconButton>
              <Avatar className="topbar-avatar">
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
            </Box>
          </Box>

          <Box className="dashboard-body">
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {activePage === 'Overview' && (
              <>
                <Box className="page-heading">
                  <Box>
                    <Typography className="eyebrow">WORKSPACE OVERVIEW</Typography>
                    <Typography variant="h4" className="page-title">
                      Good to see you, {user.name.split(' ')[0]}
                    </Typography>
                    <Typography color="text.secondary">
                      Here's what's happening with your workflows today.
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    onClick={() => setActivePage('Workflows')}
                    className="primary-action"
                  >
                    Explore workflows
                  </Button>
                </Box>

                <Box className="stats-grid">
                  {[
                    { label: 'Total workflows', value: '04', icon: <AccountTreeRoundedIcon />, color: '#5145e5' },
                    { label: 'Pending requests', value: '12', icon: <PendingActionsRoundedIcon />, color: '#d97706' },
                    { label: 'Awaiting approval', value: '08', icon: <ScheduleRoundedIcon />, color: '#0284c7' },
                    { label: 'Completed this month', value: '24', icon: <CheckCircleOutlineRoundedIcon />, color: '#059669' },
                  ].map((stat) => (
                    <Paper className="stat-card" elevation={0} key={stat.label}>
                      <Avatar
                        className="stat-icon"
                        sx={{ bgcolor: `${stat.color}15`, color: stat.color }}
                      >
                        {stat.icon}
                      </Avatar>
                      <Typography className="stat-label">{stat.label}</Typography>
                      <Typography variant="h4" className="stat-value">
                        {stat.value}
                      </Typography>
                    </Paper>
                  ))}
                </Box>

                <Box className="dashboard-columns">
                  <Paper className="content-card" elevation={0}>
                    <Box className="section-heading">
                      <Box>
                        <Typography variant="h6">Your workflows</Typography>
                        <Typography color="text.secondary" variant="body2">
                          Manage your workflow definitions
                        </Typography>
                      </Box>
                      <Button onClick={() => setActivePage('Workflows')}>
                        View all
                      </Button>
                    </Box>

                    {workflows.slice(0, 3).map((workflow) => (
                      <Box className="workflow-row" key={workflow.name}>
                        <Avatar className="workflow-icon">
                          <AccountTreeRoundedIcon />
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography className="row-title">
                            {workflow.name}
                          </Typography>
                          <Typography className="row-subtitle">
                            {workflow.category}
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          label={workflow.status}
                          color={workflow.status === 'Active' ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </Box>
                    ))}
                  </Paper>

                  <Paper className="content-card" elevation={0}>
                    <Box className="section-heading">
                      <Box>
                        <Typography variant="h6">Recent activity</Typography>
                        <Typography color="text.secondary" variant="body2">
                          Latest workspace updates
                        </Typography>
                      </Box>
                      <IconButton size="small" aria-label="More activity options">
                        <MoreHorizRoundedIcon />
                      </IconButton>
                    </Box>

                    {activities.map((activity) => (
                      <Box className="activity-row" key={activity.title}>
                        <Box className="activity-dot" />
                        <Box sx={{ flex: 1 }}>
                          <Typography className="row-title">
                            {activity.title}
                          </Typography>
                          <Typography className="row-subtitle">
                            {activity.detail}
                          </Typography>
                          <Typography className="activity-time">
                            {activity.time}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Paper>
                </Box>
              </>
            )}

            {activePage === 'Workflows' && (
              <>
                <Box className="page-heading">
                  <Box>
                    <Typography className="eyebrow">AUTOMATION</Typography>
                    <Typography variant="h4" className="page-title">
                      Workflows
                    </Typography>
                    <Typography color="text.secondary">
                      Manage and organize your workflow definitions.
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    className="primary-action"
                    onClick={() =>
                      setNotice('Workflow creation will be connected to the backend next.')
                    }
                  >
                    Create workflow
                  </Button>
                </Box>

                {notice && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    {notice}
                  </Alert>
                )}

                <Paper className="content-card" elevation={0}>
                  {workflows.map((workflow) => (
                    <Box className="workflow-row" key={workflow.name}>
                      <Avatar className="workflow-icon">
                        <AccountTreeRoundedIcon />
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography className="row-title">
                          {workflow.name}
                        </Typography>
                        <Typography className="row-subtitle">
                          {workflow.category} · Updated {workflow.updated}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={workflow.status}
                        color={workflow.status === 'Active' ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </Box>
                  ))}
                </Paper>
              </>
            )}

            {(activePage === 'Requests' || activePage === 'Approvals') && (
              <>
                <Box className="page-heading">
                  <Box>
                    <Typography className="eyebrow">WORK MANAGEMENT</Typography>
                    <Typography variant="h4" className="page-title">
                      {activePage}
                    </Typography>
                    <Typography color="text.secondary">
                      {activePage === 'Requests'
                        ? 'Track requests submitted to your workflows.'
                        : 'Review and manage approval tasks assigned to you.'}
                    </Typography>
                  </Box>
                </Box>
                <Paper className="empty-state" elevation={0}>
                  <Avatar className="empty-state-icon">
                    {activePage === 'Requests' ? (
                      <InboxRoundedIcon />
                    ) : (
                      <TaskAltRoundedIcon />
                    )}
                  </Avatar>
                  <Typography variant="h6">
                    {activePage === 'Requests'
                      ? 'Your requests will appear here'
                      : 'Your approval queue will appear here'}
                  </Typography>
                  <Typography color="text.secondary">
                    This section is ready for integration with the FlowPilot API.
                  </Typography>
                </Paper>
              </>
            )}

            {activePage === 'Settings' && (
              <>
                <Typography className="eyebrow">PREFERENCES</Typography>
                <Typography variant="h4" className="page-title">
                  Settings
                </Typography>
                <Paper className="content-card settings-card" elevation={0}>
                  <Avatar className="user-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{user.name}</Typography>
                    <Typography color="text.secondary">{user.email}</Typography>
                    <Typography className="row-subtitle">
                      Signed in to FlowPilot
                    </Typography>
                  </Box>
                </Paper>
              </>
            )}
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Box className="auth-screen">
      <Box className="auth-brand">
        <Avatar className="brand-icon">
          <AccountFlowIcon />
        </Avatar>
        <Typography variant="h5">FlowPilot</Typography>
      </Box>

      <Container maxWidth="sm" className="auth-container">
        <Paper className="auth-card" elevation={0}>
          <Box className="auth-heading">
            <Typography className="eyebrow">
              WORKFLOW MANAGEMENT, SIMPLIFIED
            </Typography>
            <Typography variant="h3">
              {mode === 'login' ? 'Welcome back.' : 'Get started.'}
            </Typography>
            <Typography color="text.secondary">
              {mode === 'login'
                ? 'Sign in to continue to your workspace.'
                : 'Create your account and start building better workflows.'}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {notice && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {notice}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            {mode === 'register' && (
              <TextField
                label="Full name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                fullWidth
                margin="normal"
                autoComplete="name"
                slotProps={{
                  htmlInput: { minLength: 2, maxLength: 100 },
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineIcon />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}

            <TextField
              label="Email address"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              fullWidth
              margin="normal"
              autoComplete="email"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <AlternateEmailIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              fullWidth
              margin="normal"
              autoComplete={
                mode === 'login' ? 'current-password' : 'new-password'
              }
              helperText={
                mode === 'register'
                  ? 'Use at least 12 characters.'
                  : undefined
              }
              slotProps={{
                htmlInput: {
                  minLength: mode === 'register' ? 12 : 1,
                  maxLength: 72,
                },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={
                          showPassword ? 'Hide password' : 'Show password'
                        }
                        onClick={() => setShowPassword((value) => !value)}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              className="submit-button"
              disabled={
                loading ||
                !email.trim() ||
                !password ||
                (mode === 'register' && !name.trim())
              }
            >
              {loading ? (
                <CircularProgress size={23} color="inherit" />
              ) : mode === 'login' ? (
                'Sign in'
              ) : (
                'Create account'
              )}
            </Button>
          </Box>

          <Box className="auth-switch">
            <Typography color="text.secondary">
              {mode === 'login'
                ? "Don't have an account?"
                : 'Already have an account?'}
            </Typography>
            <Button
              onClick={() => {
                setMode((value) => (value === 'login' ? 'register' : 'login'))
                setError('')
                setNotice('')
              }}
            >
              {mode === 'login' ? 'Create account' : 'Sign in'}
            </Button>
          </Box>
        </Paper>

        <Typography className="auth-footer">
          FLOWPILOT · WORK SMARTER, TOGETHER
        </Typography>
      </Container>
    </Box>
  )
}

export default App