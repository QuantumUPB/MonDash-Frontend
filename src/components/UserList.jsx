import React, { useState } from 'react';
import './UserList.css';

const AdminUserConfig = () => {
  const initialUsers = [
    {
      id: 1,
      email: 'john.doe@example.com',
      fullName: 'John Doe',
      affiliation: 'Company A',
      role: 'technician',
    },
    {
      id: 2,
      email: 'jane.smith@example.com',
      fullName: 'Jane Smith',
      affiliation: 'Company B',
      role: 'qkd user',
    },
  ];

  const roles = ['admin', 'technician', 'partner head', 'usecase head', 'qkd user', 'auditor'];

  const [users, setUsers] = useState(initialUsers);
  const [editedUsers, setEditedUsers] = useState({});

  const handleChange = (id, field, value) => {
    setEditedUsers((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSave = (id) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, ...editedUsers[id] } : user
      )
    );
    setEditedUsers((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const handleDiscard = (id) => {
    setEditedUsers((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  return (
    <div className="admin-user-config-container">
      <h1 className="title">Admin User Config</h1>
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
                  <input
                    type="email"
                    value={userData.email}
                    onChange={(e) => handleChange(user.id, 'email', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={userData.fullName}
                    onChange={(e) => handleChange(user.id, 'fullName', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={userData.affiliation}
                    onChange={(e) => handleChange(user.id, 'affiliation', e.target.value)}
                  />
                </td>
                <td>
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
                </td>
                <td>
                  {isEdited ? (
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
                  ) : (
                    <span>No Changes</span>
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
