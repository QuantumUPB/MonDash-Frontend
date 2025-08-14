import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { AutoRefreshContext } from './AutoRefreshContext';

const AdminUserConfig = () => {
  const [users, setUsers] = useState([]);
  const [editedUsers, setEditedUsers] = useState({});
  const [editingMode, setEditingMode] = useState(false);
  const { refreshTrigger } = useContext(AutoRefreshContext);
  const router = useRouter();

  useEffect(() => {
    axios.get('/api/users')
      .then((res) => setUsers(res.data))
      .catch((err) => console.error('Failed to fetch users:', err));
  }, [refreshTrigger]);
  const roles = ['admin', 'technician', 'partner head', 'usecase head', 'qkd user', 'auditor'];

  const handleChange = (id, field, value) => {
    setEditedUsers((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSave = async (id) => {
    const updatedData = { ...users.find((u) => u.id === id), ...editedUsers[id] };
    try {
      await axios.put(`/api/users/${id}`, updatedData);
      setUsers((prev) =>
        prev.map((user) => (user.id === id ? updatedData : user))
      );
      setEditedUsers((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    } catch (err) {
      console.error('Failed to save user:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await axios.delete(`/api/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setEditedUsers((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const handleDiscard = (id) => {
    setEditedUsers((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const goRegister = () => router.push('/register');

  return (
    <div className="admin-user-config-container">
      <div className="header">
        <h1 className="title">User Management</h1>
        <div className="actions">
          <button className="register-btn" onClick={goRegister}>Register User</button>
          <button
            className="edit-toggle-btn"
            onClick={() => setEditingMode((m) => !m)}
          >
            {editingMode ? 'Done' : 'Edit Users'}
          </button>
        </div>
      </div>
      <table className="user-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Full Name</th>
            <th>Affiliation</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isEdited = !!editedUsers[user.id];
            const userData = isEdited ? { ...user, ...editedUsers[user.id] } : user;

            return (
              <tr key={user.id}>
                <td>
                  {editingMode ? (
                    <input
                      type="email"
                      value={userData.email}
                      onChange={(e) => handleChange(user.id, 'email', e.target.value)}
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td>
                  {editingMode ? (
                    <input
                      type="text"
                      value={userData.fullName}
                      onChange={(e) => handleChange(user.id, 'fullName', e.target.value)}
                    />
                  ) : (
                    user.fullName
                  )}
                </td>
                <td>
                  {editingMode ? (
                    <input
                      type="text"
                      value={userData.affiliation}
                      onChange={(e) => handleChange(user.id, 'affiliation', e.target.value)}
                    />
                  ) : (
                    user.affiliation
                  )}
                </td>
                <td>
                  {editingMode ? (
                    <select
                      value={userData.role}
                      onChange={(e) => handleChange(user.id, 'role', e.target.value)}
                    >
                      {roles.map((role, index) => (
                        <option key={index} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  ) : (
                    user.role
                  )}
                </td>
                <td>
                  {editingMode ? (
                    <>
                      {isEdited && (
                        <>
                          <button
                            className="save-btn"
                            onClick={() => handleSave(user.id)}
                          >
                            Save
                          </button>
                          <button
                            className="discard-btn"
                            onClick={() => handleDiscard(user.id)}
                          >
                            Discard
                          </button>
                        </>
                      )}
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(user.id)}
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <span className="no-actions">-</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUserConfig;
