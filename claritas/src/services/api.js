// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export const analyzeClaim = async (payload) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/analyze`, payload);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("API Error - analyzeClaim:", error);
    
    const errorMessage = error.response?.data?.detail || 
      "An unexpected error occurred. Please try again or paste the text directly.";

    return { 
      success: false, 
      error: errorMessage 
    };
  }
};

export const getOllamaExplanation = async (payload) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/explain`, payload, {
      timeout: 12000000 // Ollama can be slow, give it 30 seconds
    });
    return response.data.explanation || "No explanation generated";
  } catch (error) {
    console.error("API Error - getOllamaExplanation:", error);
    
    if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
      return "Ollama connection failed. Make sure Ollama is running on http://localhost:11434";
    }
    
    return error.response?.data?.detail || "Failed to generate explanation. Check if Ollama is running.";
  }
};

export const submitReviewFeedback = async (payload) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/review`, payload);
    return response.data;
  } catch (error) {
    console.error("API Error - submitReviewFeedback:", error);
    return { status: "error" };
  }
};

export const fetchAllReviews = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/reviews`);
    return response.data.reviews || [];
  } catch (error) {
    console.error("API Error - fetchAllReviews:", error);
    return [];
  }
};