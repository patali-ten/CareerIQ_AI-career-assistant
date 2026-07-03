import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 90000, // 90 seconds - AI chains can take slightly longer under load
})

// ── Session storage helpers ──────────────────────────────────────────────────

export const saveSession = (cvText, jobDescription) => {
  sessionStorage.setItem('cv_text', cvText)
  sessionStorage.setItem('job_description', jobDescription)
}

export const getSession = () => ({
  cvText: sessionStorage.getItem('cv_text') || '',
  jobDescription: sessionStorage.getItem('job_description') || '',
})

// ── Existing endpoints ────────────────────────────────────────────────────────

export const uploadCV = async (file) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/upload-cv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data.cv_text
  } catch (error) {
    console.error("Error uploading CV:", error.response?.data || error.message)
    throw error
  }
}

export const analyzeCareer = async (cvText, jobDescription) => {
  try {
    const response = await api.post('/analyze', {
      cv_text: cvText,
      job_description: jobDescription
    }, {
      headers: { 'Content-Type': 'application/json' }
    })
    return response.data
  } catch (error) {
    console.error("API Analysis breakdown detail:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })
    throw error
  }
}

// ── Crew endpoints ────────────────────────────────────────────────────────────

export const crewAnalyze = async (cvText, jobDescription) => {
  try {
    const response = await api.post('/crew-analyze', {
      cv_text: cvText,
      job_description: jobDescription
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 300000, // 5 minutes — 6 sequential agents can take a while
    })
    return response.data
  } catch (error) {
    console.error("Crew analysis error:", error.response?.data || error.message)
    throw error
  }
}

// ── Interview endpoints ───────────────────────────────────────────────────────

export const startInterview = async (cvText, jobDescription) => {
  try {
    const response = await api.post('/interview/start', {
      cv_text: cvText,
      job_description: jobDescription
    }, {
      headers: { 'Content-Type': 'application/json' }
    })
    return response.data
  } catch (error) {
    console.error("Interview start error:", error.response?.data || error.message)
    throw error
  }
}

export const submitAnswer = async (sessionId, question, answer, jobDescription) => {
  try {
    const response = await api.post('/interview/answer', {
      session_id: sessionId,
      question,
      answer,
      job_description: jobDescription
    }, {
      headers: { 'Content-Type': 'application/json' }
    })
    return response.data
  } catch (error) {
    console.error("Interview answer error:", error.response?.data || error.message)
    throw error
  }
}
