import React, { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import CensusReportPage from './CensusReportPage';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function PageFormat() {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div>
      <Box sx={{ width: '100%' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          variant="fullWidth"
          centered
          textColor="primary"
          indicatorColor="primary"
          aria-label="data tabs"
        >
          <Tab label="Resource Detail Data" />
          <Tab label="Manager Detail Data" />
          <Tab label="Current Week Census Data" />
          <Tab label="Combined Data" />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <CensusReportPage section="resourceDetailData" />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <CensusReportPage section="managerDetailData" />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <CensusReportPage section="currentWeekData" />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <CensusReportPage section="combinedData" />
      </TabPanel>
    </div>
  );
}

export default PageFormat;
