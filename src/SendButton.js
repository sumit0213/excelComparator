// ComposeButton.js
import React, { forwardRef } from 'react';
import { Tooltip, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const ComposeButton = forwardRef(({ currentPageUrl, differences, resourceDetailData, setComposedEmails }, ref) => {
  const handleCompose = () => {
    // Group differences by Manager
    const groupedByManager = differences.reduce((acc, diff) => {
      const employeeId = diff['Employee ID'];

      // Fetch the manager's name, employee name, and email using Employee ID from resourceDetailData
      const resourceDetails = resourceDetailData.find(resource => resource['Employee ID'] === employeeId);
      const managerName = resourceDetails?.Manager || 'Unknown Manager';
      const managerEmail = resourceDetails?.email || '';
      const employeeName = resourceDetails?.Name || 'Unknown Employee';

      if (!acc[managerName]) {
        acc[managerName] = [];
      }

      acc[managerName].push({
        ...diff,
        managerEmail,  // Store manager email for use in message
        employeeName,  // Store employee name to replace Employee ID
      });

      return acc;
    }, {});

    const emails = Object.entries(groupedByManager).map(([managerName, employeeRecords]) => {
      const managerEmail = employeeRecords[0]?.managerEmail || ''; // Fetch the manager's email

      // Proper subject line based on the manager's name and report
      const subjectLine = `Subject: Report for Discrepancies in Employee Data - Manager: ${managerName}`;

      // Compose message body with light-colored email design
      const messageBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ccc; padding: 20px; border-radius: 8px; background-color: #f5f5f5;">
          <h2 style="background-color: #81c784; color: white; padding: 10px 15px; border-radius: 8px 8px 0 0;">Manager Report: ${managerName}</h2>
          <p style="font-size: 16px; color: #444;">Dear ${managerName},</p>
          <p style="font-size: 14px; color: #666;">
            Below is the list of employees under your management along with their current week's data discrepancies compared to the combined data. Please review and take the necessary actions.
          </p>
          <div style="margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-top: 20px;">
              <thead>
                <tr>
                  <th style="border: 1px solid #ddd; padding: 8px; background-color: #81c784; color: white;">Employee Name</th>
                  <th style="border: 1px solid #ddd; padding: 8px; background-color: #81c784; color: white;">Field</th>
                  <th style="border: 1px solid #ddd; padding: 8px; background-color: #81c784; color: white;">Current Week Value</th>
                  <th style="border: 1px solid #ddd; padding: 8px; background-color: #81c784; color: white;">Combined Data Value</th>
                </tr>
              </thead>
              <tbody>
                ${employeeRecords.map(diff => 
                  diff.differences.map(d => `
                    <tr>
                      <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${diff.employeeName}</td>
                      <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${d.field}</td>
                      <td style="border: 1px solid #ddd; padding: 8px; text-align: center; color: #ff7043;">${d.currentValue}</td>
                      <td style="border: 1px solid #ddd; padding: 8px; text-align: center; color: #388e3c;">${d.combinedValue}</td>
                    </tr>
                  `).join('')
                ).join('')}
              </tbody>
            </table>
          </div>
          <div style="background-color: #e8f5e9; padding: 10px; border-radius: 8px;">
            <p style="font-size: 14px; color: #444;">You can view the full report and take action by visiting the link below:</p>
            <a href="${currentPageUrl}" style="font-size: 16px; color: #388e3c; text-decoration: none;">View Full Report</a>
          </div>
          <p style="font-size: 14px; color: #888; margin-top: 20px;">Thank you,<br>Your Team</p>
        </div>
      `;

      return {
        employeeIds: employeeRecords.map(diff => diff['Employee ID']), // Include all employee IDs
        to_name: managerName,
        to_email: managerEmail,
        subject: subjectLine, // Add subject line
        message: `
          <p style="font-size: 16px; font-weight: bold;">${subjectLine}</p> <!-- Subject line just above the message -->
          ${messageBody}
        `
      };
    });

    setComposedEmails(emails);
  };

  return (
    <Tooltip title="Compose and Prepare Email">
      <IconButton onClick={handleCompose} ref={ref}>
        <SendIcon style={{ color: '#81c784' }} /> {/* Light green color for the icon */}
      </IconButton>
    </Tooltip>
  );
});

export default ComposeButton;
