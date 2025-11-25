'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Switch,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '@/lib/axios';

interface Category {
  id: number;
  code: string;
  name: string;
  color: string;
  sort_order: number;
}

interface ChannelMapping {
  id: number;
  utm_source: string;
  display_name: string;
  category_id: number;
  category_name: string;
  category_code: string;
  category_color: string;
  priority: number;
  active: boolean;
}

export default function ChannelManagementPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [mappings, setMappings] = useState<ChannelMapping[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<ChannelMapping | null>(null);
  const [formData, setFormData] = useState({
    utm_source: '',
    display_name: '',
    category_id: 0,
    priority: 0,
    active: true,
  });

  useEffect(() => {
    fetchCategories();
    fetchMappings();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/channel-management/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchMappings = async () => {
    try {
      const params = selectedCategory !== 'all' ? { category_id: selectedCategory } : {};
      const response = await api.get('/api/channel-management/mappings', { params });
      setMappings(response.data);
    } catch (error) {
      console.error('Failed to fetch mappings:', error);
    }
  };

  const handleOpenDialog = (mapping?: ChannelMapping) => {
    if (mapping) {
      setEditingMapping(mapping);
      setFormData({
        utm_source: mapping.utm_source,
        display_name: mapping.display_name,
        category_id: mapping.category_id,
        priority: mapping.priority,
        active: mapping.active,
      });
    } else {
      setEditingMapping(null);
      setFormData({
        utm_source: '',
        display_name: '',
        category_id: categories[0]?.id || 0,
        priority: 0,
        active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingMapping(null);
  };

  const handleSave = async () => {
    try {
      if (editingMapping) {
        await api.put(`/api/channel-management/mappings/${editingMapping.id}`, formData);
      } else {
        await api.post('/api/channel-management/mappings', formData);
      }
      fetchMappings();
      handleCloseDialog();
    } catch (error: any) {
      alert(error.response?.data?.error || '저장 실패');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await api.delete(`/api/channel-management/mappings/${id}`);
      fetchMappings();
    } catch (error) {
      alert('삭제 실패');
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await api.patch(`/api/channel-management/mappings/${id}/toggle`);
      fetchMappings();
    } catch (error) {
      alert('상태 변경 실패');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">채널 관리</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          채널 추가
        </Button>
      </Box>

      {/* 카테고리 필터 */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant={selectedCategory === 'all' ? 'contained' : 'outlined'}
          onClick={() => setSelectedCategory('all')}
          sx={{ mr: 1 }}
        >
          전체
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? 'contained' : 'outlined'}
            onClick={() => setSelectedCategory(cat.id)}
            sx={{
              mr: 1,
              bgcolor: selectedCategory === cat.id ? cat.color : undefined,
              '&:hover': {
                bgcolor: selectedCategory === cat.id ? cat.color : undefined,
              },
            }}
          >
            {cat.name}
          </Button>
        ))}
      </Box>

      {/* 채널 목록 테이블 */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>상태</TableCell>
              <TableCell>카테고리</TableCell>
              <TableCell>UTM Source</TableCell>
              <TableCell>표시 이름</TableCell>
              <TableCell align="center">우선순위</TableCell>
              <TableCell align="right">액션</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mappings.map((mapping) => (
              <TableRow key={mapping.id}>
                <TableCell>
                  <Switch
                    checked={mapping.active}
                    onChange={() => handleToggle(mapping.id)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={mapping.category_name}
                    size="small"
                    sx={{
                      bgcolor: mapping.category_color,
                      color: '#fff',
                    }}
                  />
                </TableCell>
                <TableCell>{mapping.utm_source}</TableCell>
                <TableCell>{mapping.display_name}</TableCell>
                <TableCell align="center">{mapping.priority}</TableCell>
                <TableCell align="right">
                  <Tooltip title="수정">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(mapping)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="삭제">
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(mapping.id)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 추가/수정 다이얼로그 */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingMapping ? '채널 수정' : '채널 추가'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="UTM Source"
              value={formData.utm_source}
              onChange={(e) => setFormData({ ...formData, utm_source: e.target.value })}
              fullWidth
              required
              helperText="예: naver, google, meta"
            />
            <TextField
              label="표시 이름"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              fullWidth
              required
              helperText="예: 네이버 키워드, 구글 GDN"
            />
            <FormControl fullWidth>
              <InputLabel>카테고리</InputLabel>
              <Select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="우선순위"
              type="number"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
              fullWidth
              helperText="낮을수록 우선"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>취소</Button>
          <Button onClick={handleSave} variant="contained">
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
