// DifferencesPage.js
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { IconButton, Tooltip } from '@mui/material';
import { AiOutlineZoomIn, AiOutlineZoomOut } from 'react-icons/ai';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import SearchIcon from '@mui/icons-material/Search';
import EditButton from './EditButton';  // Import EditButton component
import SendButton from './SendButton';  // Import SendButton component

import './DifferencesPage.css';

function DifferencesPage() {
  const location = useLocation();
  const { filePaths, resourceDetailData } = location.state || {};  // Destructure resourceDetailData from location.state

  const initialDifferences = Array.isArray(location.state?.differences) ? location.state.differences : [];
  const [composedEmails, setComposedEmails] = useState([]); // Manage composed emails state
  const [isEditing, setIsEditing] = useState(false); 
  const [editedDifferences, setEditedDifferences] = useState(initialDifferences);
  const [changedFields, setChangedFields] = useState({});
  const [zoomLevel, setZoomLevel] = useState(1);
  const [editableEmployees, setEditableEmployees] = useState([]); // To store editable employee IDs

  const emailData = {
    'Jenny': 'jenny@example.com',
    'A1': 'kandy@example.com',
  };

  const increaseZoom = () => {
    setZoomLevel((prevZoom) => Math.min(prevZoom + 0.1, 2));
  };

  const decreaseZoom = () => {
    setZoomLevel((prevZoom) => Math.max(prevZoom - 0.1, 0.5));
  };
  const [open, setOpen] = useState(false); // For controlling the modal
  const handleOpen = () => setOpen(true);

  const handleEditClick = () => {
   
        // Check if editing is enabled, if not open the popup for email verification
        if (!isEditing) {
          handleOpen();
        }
        setIsEditing(true); // Switch to editing mode (show Save icon)
  };

  const handleSaveClick = () => {
    if (Object.keys(changedFields).length === 0) {
      alert('No changes made.');
      setIsEditing(false); 
      return;
    }
    setIsEditing(false); // Switch back to edit mode (show Edit icon)
    setEditableEmployees([]); // Reset editable employees array after saving
    alert('Changes saved successfully!');
  };

  const handleRemoveField = (fieldToRemove) => {
    const updatedDifferences = editedDifferences
      .map((diff) => {
        const updatedFields = diff.differences.filter((field) => field.field !== fieldToRemove);
        return { ...diff, differences: updatedFields };
      })
      .filter((diff) => diff.differences.length > 0);

    setEditedDifferences(updatedDifferences);
  };

  const handleChange = (e, employeeId, fieldName) => {
    const updatedDifferences = editedDifferences.map((employee) => {
      if (employee['Employee ID'] === employeeId) {
        return {
          ...employee,
          differences: employee.differences.map((difference) => {
            if (difference.field === fieldName) {
              setChangedFields((prev) => ({
                ...prev,
                [employeeId]: {
                  ...prev[employeeId],
                  [fieldName]: e.target.value,
                },
              }));
              return { ...difference, currentValue: e.target.value }; 
            }
            return difference;
          }),
        };
      }
      return employee;
    });
    setEditedDifferences(updatedDifferences);
  };

  // Render the differences and allow editing for employees managed by the logged-in manager
  const renderDifferences = () => {
    if (editedDifferences.length === 0) return <p>No differences found.</p>;

    return editedDifferences.map((diff, index) => (
      <div key={index} style={{ marginBottom: '20px' }}>
        <h4>Employee ID: {diff['Employee ID']}</h4>
        <table className="data-table" style={{ transform: `scale(${zoomLevel})`, transformOrigin: '0 0', padding: '0 20px' }}>
          <thead>
            <tr>
              <th>Field</th>
              <th>Previous Week Data</th>
              <th>New Data</th>
              <th>Approval Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {diff.differences.map((d, idx) => (
              <tr key={idx}>
                <td>{d.field}</td>
                <td>
                  {editableEmployees.includes(diff['Employee ID']) ? (
                    <input
                      type="text"
                      value={d.currentValue !== undefined ? d.currentValue : ''}
                      onChange={(e) => handleChange(e, diff['Employee ID'], d.field)}
                    />
                  ) : (
                    d.currentValue
                  )}
                </td>
                <td>{d.combinedValue !== undefined ? d.combinedValue : ''}</td>
                <td>{d.approvalStatus ? d.approvalStatus : 'Pending'}</td>
                <td>
                  <Tooltip title="Remove Field From All Records">
                    <IconButton onClick={() => handleRemoveField(d.field)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ));
  };

  return (
    <div className="census-report-page">
      <h1>Census Report</h1>
      <div className="icon-button-container">
        {/* Pass resourceDetailData to EditButton */}
        <EditButton 
          isEditing={isEditing} 
          handleEditClick={handleEditClick} 
          handleSaveClick={handleSaveClick} 
          resourceDetailData={resourceDetailData}  // Passing resourceDetailData
          setEditableEmployees={setEditableEmployees}  // Passing setEditableEmployees
        />

        {/* Pass resourceDetailData to IconButtons */}
        <IconButtons 
          emailData={emailData} 
          differences={editedDifferences} 
          resourceDetailData={resourceDetailData}  // Passing resourceDetailData
          setComposedEmails={setComposedEmails} 
        />
      </div>
      <div className="zoom-controls">
        <AiOutlineZoomIn 
          onClick={increaseZoom} 
          style={{ cursor: 'pointer', fontSize: '24px', marginRight: '10px' }} 
        />
        <AiOutlineZoomOut 
          onClick={decreaseZoom} 
          style={{ cursor: 'pointer', fontSize: '24px' }} 
        />
      </div>

      {renderDifferences()}

      {composedEmails.length > 0 && (
        <div className="email-container">
          {composedEmails.map((email, idx) => (
            <div key={idx} className="composed-email">
              <h3>Composed Email for Employee ID: {email.employeeIds.join(', ')}</h3>
              <p><strong>To:</strong> {email.to_email}</p>
              <p><strong>Name:</strong> {email.to_name}</p>
              <div dangerouslySetInnerHTML={{ __html: email.message }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Separated IconButtons Component
const IconButtons = ({ emailData, differences, resourceDetailData, setComposedEmails }) => {
  const currentPageUrl = window.location.href;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
      <Tooltip title="Generate Report">
        <IconButton>
          <DescriptionIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Compose Email">
        <SendButton 
          currentPageUrl={currentPageUrl} 
          emailData={emailData} 
          differences={differences} 
          resourceDetailData={resourceDetailData}  // Passing resourceDetailData
          setComposedEmails={setComposedEmails} 
        />
      </Tooltip>
      <Tooltip title="Search">
        <IconButton>
          <SearchIcon />
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default DifferencesPage;
