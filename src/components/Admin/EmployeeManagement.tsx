import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Settings, 
  Trash2, 
  Edit, 
  Eye, 
  EyeOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Crown,
  User,
  Briefcase
} from 'lucide-react';
import axios from 'axios';

interface TeamMember {
  id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  lastLogin?: string;
  permissions: any;
}

interface Team {
  _id: string;
  name: string;
  subscriptionPlan: string;
  maxMembers: number;
  totalProjects: number;
  totalSubmissions: number;
}

const EmployeeManagement = () => {
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  
  // Invite form state
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'employee',
    permissions: {
      canUseSeoTools: true,
      canCreateProjects: true,
      canSubmitToDirectories: true,
      canViewSubmissionReports: true,
      canEditProjects: false,
      canDeleteProjects: false,
      canManageTeamMembers: false,
      canAccessAdminPanel: false
    }
  });

  // Role templates
  const roleTemplates = {
    owner: {
      name: 'Owner',
      description: 'Full access to all features',
      icon: Crown,
      color: 'text-purple-600',
      permissions: {
        canUseSeoTools: true,
        canUseAdvancedTools: true,
        canCreateProjects: true,
        canEditProjects: true,
        canDeleteProjects: true,
        canSubmitToDirectories: true,
        canViewSubmissionReports: true,
        canManageTeamMembers: true,
        canAccessAdminPanel: true,
        canManageUsers: true,
        canViewAnalytics: true,
        canManageBilling: true
      }
    },
    manager: {
      name: 'Manager',
      description: 'Can manage team and projects',
      icon: Briefcase,
      color: 'text-blue-600',
      permissions: {
        canUseSeoTools: true,
        canUseAdvancedTools: true,
        canCreateProjects: true,
        canEditProjects: true,
        canDeleteProjects: false,
        canSubmitToDirectories: true,
        canViewSubmissionReports: true,
        canManageTeamMembers: true,
        canViewTeamReports: true,
        canAssignTasks: true,
        canAccessAdminPanel: false,
        canManageUsers: false
      }
    },
    analyst: {
      name: 'Analyst',
      description: 'Can analyze and create reports',
      icon: User,
      color: 'text-green-600',
      permissions: {
        canUseSeoTools: true,
        canUseAdvancedTools: true,
        canCreateProjects: true,
        canEditProjects: true,
        canDeleteProjects: false,
        canSubmitToDirectories: true,
        canViewSubmissionReports: true,
        canManageTeamMembers: false,
        canAccessAdminPanel: false
      }
    },
    employee: {
      name: 'Employee',
      description: 'Basic access for daily tasks',
      icon: User,
      color: 'text-gray-600',
      permissions: {
        canUseSeoTools: true,
        canCreateProjects: true,
        canEditProjects: false,
        canDeleteProjects: false,
        canSubmitToDirectories: true,
        canViewSubmissionReports: true,
        canManageTeamMembers: false,
        canAccessAdminPanel: false
      }
    },
    viewer: {
      name: 'Viewer',
      description: 'Read-only access',
      icon: Eye,
      color: 'text-orange-600',
      permissions: {
        canUseSeoTools: true,
        canCreateProjects: false,
        canEditProjects: false,
        canDeleteProjects: false,
        canSubmitToDirectories: false,
        canViewSubmissionReports: true,
        canManageTeamMembers: false,
        canAccessAdminPanel: false
      }
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      const response = await axios.get('/api/subscription/team', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTeam(response.data.team);
      setMembers(response.data.members);
    } catch (error) {
      console.error('Error fetching team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async () => {
    try {
      await axios.post('/api/subscription/team/invite', inviteForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setShowInviteModal(false);
      setInviteForm({
        email: '',
        role: 'employee',
        permissions: roleTemplates.employee.permissions
      });
      
      fetchTeamData();
      alert('Team member invited successfully!');
    } catch (error: any) {
      alert('Error inviting team member: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleUpdateMember = async (memberId: string, updates: any) => {
    try {
      await axios.put(`/api/subscription/team/member/${memberId}`, updates, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setShowEditModal(false);
      setSelectedMember(null);
      fetchTeamData();
      alert('Team member updated successfully!');
    } catch (error: any) {
      alert('Error updating team member: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    
    try {
      await axios.delete(`/api/subscription/team/member/${memberId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      fetchTeamData();
      alert('Team member removed successfully!');
    } catch (error: any) {
      alert('Error removing team member: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleRoleChange = (role: string) => {
    setInviteForm({
      ...inviteForm,
      role,
      permissions: roleTemplates[role as keyof typeof roleTemplates].permissions
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'inactive':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleIcon = (role: string) => {
    const template = roleTemplates[role as keyof typeof roleTemplates];
    if (!template) return <User className="w-4 h-4" />;
    
    const Icon = template.icon;
    return <Icon className={`w-4 h-4 ${template.color}`} />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Employee Management</h2>
          <p className="text-gray-600">Manage your team members and their access permissions</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          disabled={!!(team && typeof team.maxMembers === 'number' && members.length >= team.maxMembers)}
          className={`px-4 py-2 rounded-lg font-medium flex items-center space-x-2 ${
            team && typeof team.maxMembers === 'number' && members.length >= team.maxMembers
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Team Stats */}
      {team && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Team Members</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {members.length} / {team.maxMembers}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Projects</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{team.totalProjects}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Submissions</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{team.totalSubmissions}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-gray-600">Plan</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1 capitalize">{team.subscriptionPlan}</p>
          </div>
        </div>
      )}

      {/* Team Members List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{member.username}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(member.role)}
                      <span className="text-sm text-gray-900 capitalize">{member.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(member.status)}
                      <span className="text-sm text-gray-900 capitalize">{member.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.lastLogin ? new Date(member.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedMember(member);
                          setShowEditModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite Team Member</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="employee@company.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(roleTemplates).map(([key, template]) => (
                    <option key={key} value={key}>
                      {template.name} - {template.description}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {Object.entries(inviteForm.permissions).map(([permission, value]) => (
                    <label key={permission} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={value as boolean}
                        onChange={(e) => setInviteForm({
                          ...inviteForm,
                          permissions: {
                            ...inviteForm.permissions,
                            [permission]: e.target.checked
                          }
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        {permission.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleInviteMember}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Team Member</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={selectedMember.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={selectedMember.role}
                  onChange={(e) => setSelectedMember({ ...selectedMember, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(roleTemplates).map(([key, template]) => (
                    <option key={key} value={key}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateMember(selectedMember.id, {
                  role: selectedMember.role,
                  permissions: roleTemplates[selectedMember.role as keyof typeof roleTemplates].permissions
                })}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement; 