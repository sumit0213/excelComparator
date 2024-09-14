import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import { combineData } from './utils/combineData';
import './CensusReportPage.css';

// Import React Icons for Zoom In and Zoom Out
import { AiOutlineZoomIn, AiOutlineZoomOut } from 'react-icons/ai';

function CensusReportPage({ section }) {
  const [resourceDetailData, setResourceDetailData] = useState(null);
  const [managerDetailData, setManagerDetailData] = useState(null);
  const [currentWeekCensusData, setCurrentWeekCensusData] = useState(null);
  const [combinedData, setCombinedData] = useState([]);
  const [differences, setDifferences] = useState([]);
  const [hasFetched, setHasFetched] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1); // Zoom level state

  const [excelFilePaths, setExcelFilePaths] = useState({
    resourceFilePath: null,
    managerFilePath: null,
    currentWeekFilePath: null,
  });

  const navigate = useNavigate();

  // Log file paths once they are set
  useEffect(() => {
    if (
      excelFilePaths.resourceFilePath ||
      excelFilePaths.managerFilePath ||
      excelFilePaths.currentWeekFilePath
    ) {
      console.log('Excel File Paths:', excelFilePaths);
    }
  }, [excelFilePaths]);

  // Fetch and parse Excel data
  const fetchExcelData = async (filePath, dataType) => {
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Error fetching file: ${response.statusText}`);
      }
      const data = await response.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

      // Update the file path in state
      setExcelFilePaths((prevPaths) => ({
        ...prevPaths,
        [dataType]: filePath, // Correctly set the file path based on dataType
      }));

      console.log(`Fetched and updated path for: ${dataType}`);

      return jsonData;
    } catch (error) {
      console.error(`Error fetching or parsing the Excel file for ${dataType}:`, error);
      return null;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (hasFetched) return;

      let resourceData = null;
      let managerData = null;
      let currentWeekData = null;

      // Fetch resource data if required
      if (['resourceDetailData', 'combinedData'].includes(section)) {
        resourceData = await fetchExcelData('/excel/ResourceDetailedReport.xlsx', 'resourceFilePath'); // Updated file name
        setResourceDetailData(resourceData);
      }

      // Fetch manager data if required
      if (['managerDetailData', 'combinedData'].includes(section)) {
        managerData = await fetchExcelData('/excel/Census Report.xlsx', 'managerFilePath'); // Updated file name
        setManagerDetailData(managerData);
        console.log('Manager Data Fetched:', managerData);
      }

      // Fetch current week census data if required
      if (['currentWeekData', 'combinedData'].includes(section)) {
        currentWeekData = await fetchExcelData('/excel/South_Region_Census.xlsx', 'currentWeekFilePath'); // Updated file name
        setCurrentWeekCensusData(currentWeekData);
        console.log('Current Week Data Fetched:', currentWeekData);
      }

      // Combine resource and manager data if both are available
      if (resourceData && managerData) {
        setCombinedData(combineData(resourceData, managerData));
      }

      setHasFetched(true);
    };

    loadData();
  }, [section, hasFetched]);

  // Function to increase zoom level
  const increaseZoom = () => {
    setZoomLevel((prevZoom) => Math.min(prevZoom + 0.1, 2)); // Set a max zoom level of 2x
  };

  // Function to decrease zoom level
  const decreaseZoom = () => {
    setZoomLevel((prevZoom) => Math.max(prevZoom - 0.1, 0.5)); // Set a minimum zoom level of 0.5x
  };

  const compareData = () => {
    if (!currentWeekCensusData || !combinedData.length) {
      console.log('Missing current week census or combined data.');
      return;
    }

    const diff = currentWeekCensusData.map((current) => {
      const match = combinedData.find((combined) => combined['Employee ID'] === current['Employee ID']);
      if (!match) return null;

      const differences = Object.keys(current).reduce((acc, key) => {
        if (current[key] !== match[key]) {
          acc.push({ field: key, currentValue: current[key], combinedValue: match[key] });
        }
        return acc;
      }, []);

      return differences.length ? { 'Employee ID': current['Employee ID'], differences } : null;
    }).filter(Boolean);

    setDifferences(diff);
    console.log('Differences found:', diff);

    // Navigate to the DifferencesPage and pass the differences, resourceDetailData, and file paths
    navigate('/differences', { 
      state: { 
        differences: diff, 
        resourceDetailData,  // Pass the resource detail data
        filePaths: excelFilePaths // Pass the file paths to the DifferencesPage 
      } 
    });
  };

  const renderTable = (data, title) => (
    !data
      ? <p>Loading {title}...</p>
      : data.length === 0
        ? <p>No data available for {title}.</p>
        : (
          <div>
            <h2>{title}</h2>
            <table className="data-table" style={{ transform: `scale(${zoomLevel})`, transformOrigin: '0 0' }}>
              <thead>
                <tr>
                  {Object.keys(data[0]).map((header) => <th key={header}>{header}</th>)}
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index}>
                    {Object.keys(row).map((header) => (
                      <td key={header}>{row[header] !== undefined ? row[header] : '-'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
  );

  return (
    <div className="census-report-page">
      <div className="header">
        <h1>Census Report</h1>
        <button className="transparent-button" onClick={compareData}>Compare Data</button>
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
      </div>

      <div className="data-display">
        {section === 'resourceDetailData' && renderTable(resourceDetailData, 'Resource Detail Data')}
        {section === 'managerDetailData' && renderTable(managerDetailData, 'Manager Detail Data')}
        {section === 'currentWeekData' && renderTable(currentWeekCensusData, 'Current Week Census Data')}
        {section === 'combinedData' && renderTable(combinedData, 'Combined Data')}
      </div>
    </div>
  );
}

export default CensusReportPage;
