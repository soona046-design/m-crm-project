'use client';

import React from 'react';
import { Box, Typography, Paper, Tabs, Tab } from '@mui/material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

interface LeadSupportingPanelProps {
  leadId: string;
}

export default function LeadSupportingPanel({ leadId }: LeadSupportingPanelProps) {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="lead supporting tabs">
          <Tab label="Tickets" {...a11yProps(0)} />
          <Tab label="Memo" {...a11yProps(1)} />
          <Tab label="Attachments" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <Typography>Tickets Content for Lead {leadId}</Typography>
        {/* TODO: 실제 티켓 리스트 컴포넌트 */}
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <Typography>Memo Content for Lead {leadId}</Typography>
        {/* TODO: 실제 메모 컴포넌트 */}
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <Typography>Attachments Content for Lead {leadId}</Typography>
        {/* TODO: 실제 첨부파일 컴포넌트 */}
      </CustomTabPanel>
    </Paper>
  );
}
