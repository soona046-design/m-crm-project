'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  TextField,
  Button,
  Grid,
  Divider,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import BusinessIcon from '@mui/icons-material/Business';
import BadgeIcon from '@mui/icons-material/Badge';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

interface UserProfile {
  user_id: string;
  login_id: string;
  name: string;
  email: string;
  role: string;
  clinic_id?: string | null; // 지점 미배정 사용자는 null
  phone?: string;
  department?: string;
  join_date?: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        console.log('Loading profile, user:', user); // 디버깅용

        // 사용자가 로그인되지 않은 경우 기본 프로필 생성
        if (!user) {
          console.log('No user found, creating default profile');
          const defaultProfile: UserProfile = {
            user_id: 'guest',
            login_id: 'guest',
            name: '게스트 사용자',
            email: 'guest@example.com',
            role: '게스트',
            phone: '',
            department: '',
            join_date: ''
          };
          setProfile(defaultProfile);
          setMessage({ type: 'error', text: '로그인이 필요합니다. 기본 프로필을 표시합니다.' });
        } else {
          // 현재 로그인된 사용자 정보를 기반으로 프로필 설정
          const profileData: UserProfile = {
            user_id: user.user_id || 'unknown',
            login_id: user.login_id || 'unknown',
            name: user.name || '이름 없음',
            email: user.email || 'email@example.com',
            role: user.role || '역할 없음',
            clinic_id: user.clinic_id,
            phone: '010-1234-5678', // Mock data
            department: '상담팀', // Mock data
            join_date: '2025-01-01' // Mock data
          };

          console.log('Profile data created:', profileData);
          setProfile(profileData);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        setMessage({ type: 'error', text: '프로필 로딩에 실패했습니다.' });

        // 오류 발생 시에도 기본 프로필 설정
        const fallbackProfile: UserProfile = {
          user_id: 'error',
          login_id: 'error',
          name: '오류 사용자',
          email: 'error@example.com',
          role: '오류',
          phone: '',
          department: '',
          join_date: ''
        };
        setProfile(fallbackProfile);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
    setMessage(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setMessage(null);
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      setSaving(true);

      // Mock save implementation
      await new Promise(resolve => setTimeout(resolve, 1000));

      setIsEditing(false);
      setMessage({ type: 'success', text: '프로필이 성공적으로 업데이트되었습니다.' });
    } catch (error) {
      console.error('Failed to save profile:', error);
      setMessage({ type: 'error', text: '프로필 저장에 실패했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    if (profile) {
      setProfile({
        ...profile,
        [field]: value
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // 안전성을 위해 여전히 null 체크 유지
  if (!profile) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">프로필 데이터가 없습니다. 페이지를 새로고침 해주세요.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        사용자 프로필
      </Typography>

      {message && (
        <Alert
          severity={message.type}
          sx={{ mb: 3 }}
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* 프로필 헤더 */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ width: 80, height: 80, mr: 3, bgcolor: 'primary.main' }}>
                <PersonIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h5" gutterBottom>
                  {profile.name}
                </Typography>
                <Chip label={profile.role} color="primary" />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  ID: {profile.login_id}
                </Typography>
              </Box>
              <Box>
                {!isEditing ? (
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                  >
                    수정
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? <CircularProgress size={20} /> : '저장'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      취소
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* 기본 정보 */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                기본 정보
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="이름"
                    value={profile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="로그인 ID"
                    value={profile.login_id}
                    disabled // 로그인 ID는 수정 불가
                    InputProps={{
                      startAdornment: <BadgeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="이메일"
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="전화번호"
                    value={profile.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="부서"
                    value={profile.department || ''}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="입사일"
                    type="date"
                    value={profile.join_date || ''}
                    onChange={(e) => handleInputChange('join_date', e.target.value)}
                    disabled={!isEditing}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 계정 정보 */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                계정 정보
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  사용자 ID
                </Typography>
                <Typography variant="body1">
                  {profile.user_id}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  역할
                </Typography>
                <Chip label={profile.role} size="small" color="primary" />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  클리닉 ID
                </Typography>
                <Typography variant="body1">
                  {profile.clinic_id || 'N/A'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}