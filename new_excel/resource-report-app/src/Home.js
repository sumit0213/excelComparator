import React, { useState } from 'react';
import Dropzone from 'react-dropzone';
import * as XLSX from 'xlsx';
import DataGrid from 'react-data-grid';
import './Home.css';

const Home = () => {
  const [resourceFiles, setResourceFiles] = useState([]);
  const [wellmedFiles, setWellmedFiles] = useState([]);
  const [mergedData, setMergedData] = useState(null);
  const [columns, setColumns] = useState([]);
  const [resourceUploadStatus, setResourceUploadStatus] = useState('');
  const [wellmedUploadStatus, setWellmedUploadStatus] = useState('');
  const [step, setStep] = useState(1);

  const handleResourceDrop = (acceptedFiles) => {
    setResourceFiles(acceptedFiles);
    setResourceUploadStatus('');
  };

  const handleWellmedDrop = (acceptedFiles) => {
    setWellmedFiles(acceptedFiles);
    setWellmedUploadStatus('');
  };

  const handleFileUpload = (files, setStatus) => {
    if (files.length === 0) {
      setStatus('Please select files to upload');
      return;
    }

    const promises = files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          resolve(json);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });
    });

    return Promise.all(promises);
  };

  const handleResourceUpload = () => {
    handleFileUpload(resourceFiles, setResourceUploadStatus)
      .then(data => {
        console.log('Resource Detail Report:', data);
        setResourceUploadStatus('Resource Detail Reports uploaded successfully');
        setStep(2);
      })
      .catch(() => setResourceUploadStatus('Failed to upload Resource Detail Reports'));
  };

  const handleWellmedUpload = () => {
    handleFileUpload(wellmedFiles, setWellmedUploadStatus)
      .then(data => {
        console.log('WellMed Resource Detail Report:', data);
        setWellmedUploadStatus('WellMed Resource Detail Report uploaded successfully');
        setStep(3);
      })
      .catch(() => setWellmedUploadStatus('Failed to upload WellMed Resource Detail Report'));
  };

  const mergeFiles = () => {
    handleFileUpload([...resourceFiles, ...wellmedFiles], () => {})
      .then(fileData => {
        if (fileData.length < 3) {
          alert('Please upload all three files before merging');
          return;
        }

        const employeeIdMap = new Map();

        fileData.forEach(data => {
          data.forEach(row => {
            const empId = row['Employee ID'];
            if (!employeeIdMap.has(empId)) {
              employeeIdMap.set(empId, { ...row });
            } else {
              employeeIdMap.set(empId, { ...employeeIdMap.get(empId), ...row });
            }
          });
        });

        const finalMergedData = [];
        employeeIdMap.forEach(value => {
          finalMergedData.push(value);
        });

        setMergedData(finalMergedData);

        const cols = Object.keys(finalMergedData[0]).map(key => ({
          key,
          name: key,
          editable: true
        }));

        setColumns(cols);
        setStep(4);
      })
      .catch(() => alert('Failed to merge files'));
  };

  const handleRowsUpdate = ({ fromRow, toRow, updated }) => {
    setMergedData(prevData =>
      prevData.map((row, index) => {
        if (index >= fromRow && index <= toRow) {
          return { ...row, ...updated };
        }
        return row;
      })
    );
  };

  return (
    <div className="container">
      <div className="sidebar">
        <h1 className="header">Resource Detail Report</h1>
        <div className="stepper">
          <div className={`step ${step >= 1 ? 'completed' : ''}`}>1. Upload Resource Reports</div>
          <div className={`step ${step >= 2 ? 'completed' : ''}`}>2. Upload WellMed Report</div>
          <div className={`step ${step >= 3 ? 'completed' : ''}`}>3. Merge Files</div>
          <div className={`step ${step >= 4 ? 'completed' : ''}`}>4. Complete</div>
        </div>

        <section className="section">
          <h2>Upload 2 Excel Resource Detail Reports</h2>
          <Dropzone onDrop={handleResourceDrop}>
            {({ getRootProps, getInputProps }) => (
              <div {...getRootProps()} className="dropzone small-dropzone">
                <input {...getInputProps()} multiple />
                <p>Drag 'n' drop up to 2 files here, or click to select files</p>
                {resourceFiles.map(file => (
                  <p key={file.name} className="fileName">{file.name}</p>
                ))}
              </div>
            )}
          </Dropzone>
          <button onClick={handleResourceUpload} className="uploadButton">Upload Resource Detail Reports</button>
          {resourceUploadStatus && <p className="statusMessage">{resourceUploadStatus}</p>}
        </section>

        <section className="section">
          <h2>Upload 1 WellMed Resource Detail Report</h2>
          <Dropzone onDrop={handleWellmedDrop}>
            {({ getRootProps, getInputProps }) => (
              <div {...getRootProps()} className="dropzone small-dropzone">
                <input {...getInputProps()} />
                <p>Drag 'n' drop a file here, or click to select a file</p>
                {wellmedFiles.map(file => (
                  <p key={file.name} className="fileName">{file.name}</p>
                ))}
              </div>
            )}
          </Dropzone>
          <button onClick={handleWellmedUpload} className="uploadButton">Upload WellMed Report</button>
          {wellmedUploadStatus && <p className="statusMessage">{wellmedUploadStatus}</p>}
        </section>

        <button onClick={mergeFiles} className="mergeButton">Merge Files</button>
      </div>
      <div className="content">
        {mergedData ? (
          <div className="data-grid-container">
            <DataGrid
              columns={columns}
              rows={mergedData}
              onRowsUpdate={handleRowsUpdate}
            />
          </div>
        ) : (
          <p>Please upload and merge the files to see the data here</p>
        )}
      </div>
    </div>
  );
};

export default Home;
