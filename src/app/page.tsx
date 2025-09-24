import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import Grid from '@mui/material/Grid';

export default function Home() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Home Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* 상단 KPI 카드 (소형) */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center', height: 120 }}>
            <Typography variant="h6">Total Leads</Typography>
            <Typography variant="h4" color="primary">1,234</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center', height: 120 }}>
            <Typography variant="h6">Appointments</Typography>
            <Typography variant="h4" color="secondary">567</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center', height: 120 }}>
            <Typography variant="h6">Revenue</Typography>
            <Typography variant="h4" sx={{ color: 'success.main' }}>₩89,012,345</Typography>
          </Paper>
        </Grid>

        {/* 중단 Funnel/채널 성과 (중형 카드) */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 300 }}>
            <Typography variant="h5" gutterBottom>Funnel Chart (Placeholder)</Typography>
            <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100' }}>
              Funnel Chart Area
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 300 }}>
            <Typography variant="h5" gutterBottom>Channel Performance (Placeholder)</Typography>
            <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100' }}>
              Bar Chart Area
            </Box>
          </Paper>
        </Grid>

        {/* 하단 상담자별 성과/히트맵 (대형 카드) */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h5" gutterBottom>Agent Performance (Placeholder)</Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100' }}>
              Data Table / Heatmap Area
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}