import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 90000,
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

// ── CV Upload ────────────────────────────────────────────────────────────────

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

// ── Career Analysis ──────────────────────────────────────────────────────────

export const analyzeCareer = async (cvText, jobDescription) => {
  try {
    const response = await api.post('/crew-analyze', {
      cv_text: cvText,
      job_description: jobDescription
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 300000,
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

// ── Cover Letter ─────────────────────────────────────────────────────────────

export const generateCoverLetter = async (cvText, jobDescription) => {
  const response = await fetch(`${BASE_URL}/generate-cover-letter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cv_text: cvText, job_description: jobDescription }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.detail || "Failed to generate cover letter")
  }

  return response.blob()
}

// ── Crew Analysis ────────────────────────────────────────────────────────────

export const crewAnalyze = async (cvText, jobDescription) => {
  try {
    const response = await api.post('/crew-analyze', {
      cv_text: cvText,
      job_description: jobDescription
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 300000,
    })
    return response.data
  } catch (error) {
    console.error("Crew analysis error:", error.response?.data || error.message)
    throw error
  }
}

// ── Interview ────────────────────────────────────────────────────────────────

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