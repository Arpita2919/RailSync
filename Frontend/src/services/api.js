/**
 * RailSync 2.0 — Unified API Client
 * Connects Frontend directly to FastAPI Backend on http://127.0.0.1:8000
 * Orchestrates Layer 0 (Master Data), Layer 1 (Risk/ML), Layer 2 (Negotiation),
 * and Layer 3 (CP-SAT Block Optimization).
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { detail: errorText };
      }
      throw new Error(errorData.detail || `Request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API Error [${options.method || 'GET'} ${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  // System Health
  getHealth: () => request('/health'),

  // Layer 0 / Tasks
  getTasks: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.department) query.append('department', params.department);
    if (params.segment_id) query.append('segment_id', params.segment_id);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/tasks${qs}`);
  },

  ingestTask: (taskData) =>
    request('/ingest/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    }),

  // Layer 1 / Risk & ML Predictions
  getRiskSegments: (params = {}) => {
    const query = new URLSearchParams();
    if (params.min_risk) query.append('min_risk', params.min_risk);
    if (params.division) query.append('division', params.division);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/risk/segments${qs}`);
  },

  getSegmentRisk: (segmentId) => request(`/risk/${encodeURIComponent(segmentId)}`),

  // Layer 2 / Negotiation
  negotiateTasks: (tasks) =>
    request('/negotiate', {
      method: 'POST',
      body: JSON.stringify(tasks),
    }),

  // Layer 3 / CP-SAT Optimization
  runOptimization: ({ policy = 'balanced', horizon = 'weekly', objective_weights = null }) =>
    request('/optimize', {
      method: 'POST',
      body: JSON.stringify({ policy, horizon, objective_weights }),
    }),

  runWhatIf: (data) =>
    request('/optimize/whatif', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Plans & Assignments
  getCurrentPlan: (planType = 'weekly') =>
    request(`/plan/current?plan_type=${encodeURIComponent(planType)}`),

  getPlanById: (planId) => request(`/plan/${encodeURIComponent(planId)}`),

  // Feedback & Metrics
  getFeedbackMetrics: () => request('/feedback/metrics'),

  submitFeedback: (feedbackData) =>
    request('/feedback/block', {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    }),
};

export default api;
