import React, { useState, useEffect } from 'react';
import { IconButton, Tooltip, Modal, Box, Button, TextField, Typography, CircularProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const EditButton = ({ handleSaveClick, employeeID, resourceDetailData, setEditableEmployees }) => {
  const [isEditing, setIsEditing] = useState(false); // Toggle for enabling/disabling edit mode
  const [open, setOpen] = useState(false); // For controlling the modal
  const [userEmail, setUserEmail] = useState(''); // To store the entered email
  const [error, setError] = useState(''); // For showing error message
  const [loading, setLoading] = useState(false); // For showing loading spinner
  const [managerName, setManagerName] = useState(''); // Store the manager's name

  // Log the resourceDetailData to the console for debugging
  useEffect(() => {
    console.log('resourceDetailData:', resourceDetailData);
  }, [resourceDetailData]);

  // Function to find the manager based on the email input by the user
  const getManagerByEmail = (email) => {
    if (!resourceDetailData || !Array.isArray(resourceDetailData)) {
      console.error("resourceDetailData is undefined or not an array");
      return null;
    }

    // Find the manager by matching the input email with the email in resourceDetailData
    const manager = resourceDetailData.find(emp => emp.email === email);

    if (!manager) {
      console.error(`No manager found with email ${email}`);
      return null;
    }

    // Log the found manager for further debugging
    console.log('Found manager:', manager);
    return manager;
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleEmailChange = (e) => {
    setUserEmail(e.target.value);
  };

  const handleEmailSubmit = async () => {
    setLoading(true); // Show loading spinner
    try {
      // Simulate delay for processing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get the manager using the entered email
      const manager = getManagerByEmail(userEmail);

      if (!manager) {
        setError('Manager not found for the given email.');
        setLoading(false);
        return;
      }

      // Extract and store the manager's name
      setManagerName(manager.Name);

      // Find all employees managed by this manager
      const managedEmployees = resourceDetailData.filter(emp => emp.Manager === manager.Name);

      if (managedEmployees.length === 0) {
        setError('No employees found under this manager.');
        setLoading(false);
        return;
      }

      // Log the managed employees for debugging
      console.log('Managed employees:', managedEmployees);

      // Enable editing for employees associated with this manager
      setEditableEmployees(managedEmployees.map(emp => emp['Employee ID']));

      setIsEditing(true); // Enable editing
      setError(''); // Clear any error message
      handleClose(); // Close the popup
    } catch (err) {
      console.error(err);
      setError('Something went wrong!'); // Display a generic error message
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  const handleEditClick = () => {
    // Check if editing is enabled, if not open the popup for email verification
    if (!isEditing) {
      handleOpen();
    }
  };

  // Handle the save action and switch back to the edit icon
  const handleSaveButtonClick = () => {
    handleSaveClick();  // Call the parent save function
    setIsEditing(false);  // Disable editing (switch back to Edit icon)
  };

  return (
    <>
      {!isEditing ? (
        <>
          <Tooltip title="Edit">
            <IconButton onClick={handleEditClick}>
              <EditIcon />
            </IconButton>
          </Tooltip>

          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Enter Manager's Email
              </Typography>
              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                value={userEmail}
                onChange={handleEmailChange}
                sx={{ mt: 2 }}
              />
              {error && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  {error}
                </Typography>
              )}
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                {loading ? (
                  <CircularProgress />
                ) : (
                  <Button onClick={handleEmailSubmit} variant="contained" color="primary">
                    OK
                  </Button>
                )}
              </Box>
            </Box>
          </Modal>
        </>
      ) : (
        <Tooltip title="Save">
          <IconButton onClick={handleSaveButtonClick}>
            <SaveIcon />
          </IconButton>
        </Tooltip>
      )}
    </>
  );
};

export default EditButton;
