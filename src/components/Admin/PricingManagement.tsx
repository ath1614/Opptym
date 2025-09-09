import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Star, 
  StarOff, 
  ArrowUp, 
  ArrowDown,
  Save,
  X,
  CreditCard,
  Users,
  Zap,
  BarChart3
} from 'lucide-react';
import axios from 'axios';

interface PricingPlan {
  _id: string;
  name: string;
  description: string;
  features: string[];
  price: {
    monthly: number;
    yearly: number;
  };
  limits: {
    projects: number;
    submissions: number;
    tools: number;
    apiCalls: number;
  };
  stripePriceIds: {
    monthly: string | null;
    yearly: string | null;
  };
  trialDays: number;
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  metadata: {
    color: string;
    gradient: string;
    icon: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface CreatePlanData {
  name: string;
  description: string;
  features: string[];
  price: {
    monthly: number;
    yearly: number;
  };
  limits: {
    projects: number;
    submissions: number;
    tools: number;
    apiCalls: number;
  };
  trialDays: number;
  isActive: boolean;
  isPopular: boolean;
  metadata: {
    color: string;
    gradient: string;
    icon: string;
  };
}

const PricingManagement: React.FC = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [createPlanData, setCreatePlanData] = useState<CreatePlanData>({
    name: '',
    description: '',
    features: [''],
    price: {
      monthly: 0,
      yearly: 0
    },
    limits: {
      projects: 1,
      submissions: 10,
      tools: 10,
      apiCalls: 20
    },
    trialDays: 0,
    isActive: true,
    isPopular: false,
    metadata: {
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      icon: 'star'
    }
  });

  const colorOptions = [
    { value: 'blue', gradient: 'from-blue-500 to-blue-600', label: 'Blue' },
    { value: 'green', gradient: 'from-green-500 to-green-600', label: 'Green' },
    { value: 'purple', gradient: 'from-purple-500 to-purple-600', label: 'Purple' },
    { value: 'orange', gradient: 'from-orange-500 to-orange-600', label: 'Orange' },
    { value: 'red', gradient: 'from-red-500 to-red-600', label: 'Red' },
    { value: 'indigo', gradient: 'from-indigo-500 to-indigo-600', label: 'Indigo' }
  ];

  // Fetch pricing plans
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/pricing-plans', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching pricing plans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Create new plan
  const handleCreatePlan = async () => {
    try {
      const response = await axios.post('/api/admin/pricing-plans', createPlanData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.data.success) {
        setShowCreateModal(false);
        setCreatePlanData({
          name: '',
          description: '',
          features: [''],
          price: { monthly: 0, yearly: 0 },
          limits: { projects: 1, submissions: 10, tools: 10, apiCalls: 20 },
          trialDays: 0,
          isActive: true,
          isPopular: false,
          metadata: { color: 'blue', gradient: 'from-blue-500 to-blue-600', icon: 'star' }
        });
        fetchPlans();
      }
    } catch (error) {
      console.error('Error creating plan:', error);
    }
  };

  // Update plan
  const handleUpdatePlan = async (id: string, updateData: Partial<PricingPlan>) => {
    try {
      const response = await axios.put(`/api/admin/pricing-plans/${id}`, updateData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.data.success) {
        setEditingPlan(null);
        fetchPlans();
      }
    } catch (error) {
      console.error('Error updating plan:', error);
    }
  };

  // Delete plan
  const handleDeletePlan = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pricing plan?')) return;
    
    try {
      const response = await axios.delete(`/api/admin/pricing-plans/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.data.success) {
        fetchPlans();
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  // Toggle plan active status
  const handleToggleActive = async (id: string) => {
    try {
      const response = await axios.patch(`/api/admin/pricing-plans/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.data.success) {
        fetchPlans();
      }
    } catch (error) {
      console.error('Error toggling plan status:', error);
    }
  };

  // Reorder plans
  const handleReorder = async (fromIndex: number, toIndex: number) => {
    const newPlans = [...plans];
    const [movedPlan] = newPlans.splice(fromIndex, 1);
    newPlans.splice(toIndex, 0, movedPlan);

    // Update sort orders
    const planOrders = newPlans.map((plan, index) => ({
      id: plan._id,
      sortOrder: index
    }));

    try {
      const response = await axios.patch('/api/admin/pricing-plans/reorder', { planOrders }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.data.success) {
        setPlans(newPlans);
      }
    } catch (error) {
      console.error('Error reordering plans:', error);
    }
  };

  // Add feature
  const addFeature = () => {
    setCreatePlanData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  // Remove feature
  const removeFeature = (index: number) => {
    setCreatePlanData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  // Update feature
  const updateFeature = (index: number, value: string) => {
    setCreatePlanData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pricing Plans Management</h2>
          <p className="text-gray-600 dark:text-gray-300">Manage your subscription plans and pricing</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create New Plan
        </button>
      </div>

      {/* Plans List */}
      <div className="grid gap-6">
        {plans.map((plan, index) => (
          <div
            key={plan._id}
            className={`p-6 border rounded-xl transition-all ${
              plan.isActive 
                ? 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800' 
                : 'border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 opacity-75'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${plan.metadata.gradient} flex items-center justify-center`}>
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
                    {plan.isPopular && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                        Popular
                      </span>
                    )}
                    {!plan.isActive && (
                      <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{plan.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleActive(plan._id)}
                  className={`p-2 rounded-lg transition-colors ${
                    plan.isActive 
                      ? 'text-green-600 hover:bg-green-50' 
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                  title={plan.isActive ? 'Deactivate' : 'Activate'}
                >
                  {plan.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                
                <button
                  onClick={() => setEditingPlan(plan)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => handleDeletePlan(plan._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Plan Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pricing */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Pricing
                </h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Monthly:</span>
                    <span className="font-medium">₹{plan.price.monthly}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Yearly:</span>
                    <span className="font-medium">₹{plan.price.yearly}</span>
                  </div>
                </div>
              </div>

              {/* Limits */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Limits
                </h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Projects:</span>
                    <span className="font-medium">{plan.limits.projects === -1 ? 'Unlimited' : plan.limits.projects}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Submissions:</span>
                    <span className="font-medium">{plan.limits.submissions === -1 ? 'Unlimited' : plan.limits.submissions}</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Features
                </h4>
                <div className="space-y-1">
                  {plan.features.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="text-sm text-gray-600 dark:text-gray-300">
                      • {feature}
                    </div>
                  ))}
                  {plan.features.length > 3 && (
                    <div className="text-sm text-gray-500">
                      +{plan.features.length - 3} more...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Reorder Controls */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
              <span className="text-sm text-gray-500">Order:</span>
              <button
                onClick={() => handleReorder(index, index - 1)}
                disabled={index === 0}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium">{index + 1}</span>
              <button
                onClick={() => handleReorder(index, index + 1)}
                disabled={index === plans.length - 1}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Pricing Plan</h3>
                <button
                  onClick={() => setEditingPlan(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Plan Name
                    </label>
                    <input
                      type="text"
                      value={editingPlan.name}
                      onChange={(e) => setEditingPlan(prev => prev ? { ...prev, name: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Color Theme
                    </label>
                    <select
                      value={editingPlan.metadata.color}
                      onChange={(e) => {
                        const selectedColor = colorOptions.find(c => c.value === e.target.value);
                        setEditingPlan(prev => prev ? {
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            color: e.target.value,
                            gradient: selectedColor?.gradient || 'from-blue-500 to-blue-600'
                          }
                        } : null);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {colorOptions.map(color => (
                        <option key={color.value} value={color.value}>{color.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editingPlan.description}
                    onChange={(e) => setEditingPlan(prev => prev ? { ...prev, description: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                {/* Pricing */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Pricing</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Monthly Price (₹)
                      </label>
                      <input
                        type="number"
                        value={editingPlan.price.monthly}
                        onChange={(e) => setEditingPlan(prev => prev ? {
                          ...prev,
                          price: { ...prev.price, monthly: Number(e.target.value) }
                        } : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Yearly Price (₹)
                      </label>
                      <input
                        type="number"
                        value={editingPlan.price.yearly}
                        onChange={(e) => setEditingPlan(prev => prev ? {
                          ...prev,
                          price: { ...prev.price, yearly: Number(e.target.value) }
                        } : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Settings */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={editingPlan.trialDays}
                        onChange={(e) => setEditingPlan(prev => prev ? { ...prev, trialDays: Number(e.target.value) } : null)}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                      />
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Trial Days
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={editingPlan.isPopular}
                        onChange={(e) => setEditingPlan(prev => prev ? { ...prev, isPopular: e.target.checked } : null)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Mark as Popular
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                <button
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdatePlan(editingPlan._id, editingPlan)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Update Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Pricing Plan</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Plan Name
                    </label>
                    <input
                      type="text"
                      value={createPlanData.name}
                      onChange={(e) => setCreatePlanData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Professional"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Color Theme
                    </label>
                    <select
                      value={createPlanData.metadata.color}
                      onChange={(e) => {
                        const selectedColor = colorOptions.find(c => c.value === e.target.value);
                        setCreatePlanData(prev => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            color: e.target.value,
                            gradient: selectedColor?.gradient || 'from-blue-500 to-blue-600'
                          }
                        }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {colorOptions.map(color => (
                        <option key={color.value} value={color.value}>{color.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={createPlanData.description}
                    onChange={(e) => setCreatePlanData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Describe what this plan offers..."
                  />
                </div>

                {/* Pricing */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Pricing</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Monthly Price (₹)
                      </label>
                      <input
                        type="number"
                        value={createPlanData.price.monthly}
                        onChange={(e) => setCreatePlanData(prev => ({
                          ...prev,
                          price: { ...prev.price, monthly: Number(e.target.value) }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Yearly Price (₹)
                      </label>
                      <input
                        type="number"
                        value={createPlanData.price.yearly}
                        onChange={(e) => setCreatePlanData(prev => ({
                          ...prev,
                          price: { ...prev.price, yearly: Number(e.target.value) }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Limits */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Limits</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Projects
                      </label>
                      <input
                        type="number"
                        value={createPlanData.limits.projects}
                        onChange={(e) => setCreatePlanData(prev => ({
                          ...prev,
                          limits: { ...prev.limits, projects: Number(e.target.value) }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="-1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Submissions
                      </label>
                      <input
                        type="number"
                        value={createPlanData.limits.submissions}
                        onChange={(e) => setCreatePlanData(prev => ({
                          ...prev,
                          limits: { ...prev.limits, submissions: Number(e.target.value) }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="-1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tools
                      </label>
                      <input
                        type="number"
                        value={createPlanData.limits.tools}
                        onChange={(e) => setCreatePlanData(prev => ({
                          ...prev,
                          limits: { ...prev.limits, tools: Number(e.target.value) }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="-1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        API Calls
                      </label>
                      <input
                        type="number"
                        value={createPlanData.limits.apiCalls}
                        onChange={(e) => setCreatePlanData(prev => ({
                          ...prev,
                          limits: { ...prev.limits, apiCalls: Number(e.target.value) }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Features</h4>
                  <div className="space-y-2">
                    {createPlanData.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter feature..."
                        />
                        <button
                          onClick={() => removeFeature(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addFeature}
                      className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 transition-colors"
                    >
                      + Add Feature
                    </button>
                  </div>
                </div>

                {/* Settings */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={createPlanData.trialDays}
                        onChange={(e) => setCreatePlanData(prev => ({ ...prev, trialDays: Number(e.target.value) }))}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                      />
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Trial Days
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={createPlanData.isPopular}
                        onChange={(e) => setCreatePlanData(prev => ({ ...prev, isPopular: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Mark as Popular
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePlan}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Create Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingManagement;
