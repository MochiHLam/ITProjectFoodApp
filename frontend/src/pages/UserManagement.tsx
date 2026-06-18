import React from 'react'
import { listUsers, updateUser as apiUpdateUser, deleteUser as apiDeleteUser, type User } from '../lib/users'
import { 
  Box, 
  Paper, 
  Typography, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  Button, 
  Chip,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'

// Using API types

export default function UserManagement() {
  const [users, setUsers] = React.useState<User[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null)
  const [editDialog, setEditDialog] = React.useState(false)
  const [editRole, setEditRole] = React.useState<'user' | 'admin'>('user')
  const [editActive, setEditActive] = React.useState(true)

  React.useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    try {
      setLoading(true)
      const data = await listUsers()
      setUsers(data)
    } catch (err) {
      console.error('Load users error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function updateUser() {
    if (!selectedUser) return
    
    try {
      await apiUpdateUser(selectedUser._id, { role: editRole, isActive: editActive })
      await loadUsers()
      setEditDialog(false)
      setSelectedUser(null)
    } catch (err) {
      console.error('Update user error:', err)
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm('Are you sure you want to delete this user?')) return
    
    try {
      await apiDeleteUser(userId)
      await loadUsers()
    } catch (err) {
      console.error('Delete user error:', err)
    }
  }

  function openEditDialog(user: User) {
    setSelectedUser(user)
    setEditRole(user.role)
    setEditActive(user.isActive)
    setEditDialog(true)
  }

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading users...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">User Management</Typography>
      </Stack>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Provider</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.name || 'N/A'}</TableCell>
                <TableCell>{user.email || 'N/A'}</TableCell>
                <TableCell>
                  <Chip 
                    label={user.role} 
                    color={user.role === 'admin' ? 'error' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={user.isActive ? 'Active' : 'Inactive'} 
                    color={user.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{user.oauthProvider || 'Email'}</TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  <IconButton 
                    size="small" 
                    onClick={() => openEditDialog(user)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => deleteUser(user._id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              User: {selectedUser?.name} ({selectedUser?.email})
            </Typography>
            
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as 'user' | 'admin')}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={editActive}
                  onChange={(e) => setEditActive(e.target.checked)}
                />
              }
              label="Active Account"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button onClick={updateUser} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
