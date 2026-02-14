import os
import google.generativeai as genai
from typing import Dict, List, Optional, Any
import json
from django.conf import settings
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)


class GeminiService:
    """
    Service class for interacting with Google Gemini AI
    """
    
    def __init__(self):
        self.api_key = getattr(settings, 'GEMINI_API_KEY', os.getenv('GEMINI_API_KEY'))
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash')
        else:
            logger.warning("GEMINI_API_KEY not found - AI features will be disabled")
            self.model = None
    
    def _check_api_key(self):
        """Check if API key is available"""
        if not self.api_key or not self.model:
            raise ValueError("GEMINI_API_KEY not configured - AI features are disabled")

    def is_available(self) -> bool:
        """Return True when the Gemini client is configured."""
        return bool(self.api_key and self.model)
    
    def generate_content(self, prompt: str, **kwargs) -> str:
        """
        Generate content using Gemini AI
        """
        self._check_api_key()
        
        try:
            response = self.model.generate_content(prompt, **kwargs)
            return response.text
        except Exception as e:
            logger.error(f"Gemini API error: {str(e)}")
            raise
    
    def analyze_opportunity_match(self, user_profile: Dict, opportunity: Dict) -> Dict:
        """
        Analyze how well an opportunity matches a user's profile
        Returns match score and reasoning
        """
        try:
            self._check_api_key()
        except ValueError:
            return {
                "match_score": 50,
                "reasoning": "AI analysis unavailable - API key not configured",
                "strengths": [],
                "gaps": [],
                "recommendations": []
            }
        prompt = f"""
        Analyze how well this opportunity matches the user's profile and provide a match score.
        
        User Profile:
        - Skills: {user_profile.get('skills', [])}
        - Experience: {user_profile.get('experience_years', 0)} years
        - Education: {user_profile.get('education', '')}
        - Career Goals: {user_profile.get('career_goals', '')}
        - Interests: {user_profile.get('interests', [])}
        
        Opportunity:
        - Title: {opportunity.get('title', '')}
        - Description: {opportunity.get('description', '')}
        - Requirements: {opportunity.get('requirements', '')}
        - Category: {opportunity.get('category', '')}
        - Organization: {opportunity.get('organization', '')}
        
        Provide response in JSON format:
        {{
            "match_score": <number between 0-100>,
            "reasoning": "<detailed explanation of why this is a good/bad match>",
            "strengths": ["<strength 1>", "<strength 2>"],
            "gaps": ["<gap 1>", "<gap 2>"],
            "recommendations": ["<recommendation 1>", "<recommendation 2>"]
        }}
        """
        
        try:
            response = self.generate_content(prompt)
            # Clean the response to extract JSON
            response = response.strip()
            if response.startswith('```json'):
                response = response[7:-3].strip()
            elif response.startswith('```'):
                response = response[3:-3].strip()
            
            return json.loads(response)
        except (json.JSONDecodeError, Exception) as e:
            logger.error(f"Error analyzing opportunity match: {str(e)}")
            return {
                "match_score": 50,
                "reasoning": "Unable to analyze match due to technical error",
                "strengths": [],
                "gaps": [],
                "recommendations": []
            }
    
    def improve_application_document(self, document_type: str, content: str, opportunity: Dict) -> Dict:
        """
        Provide suggestions to improve application documents (CV, cover letter, etc.)
        """
        try:
            self._check_api_key()
        except ValueError:
            return {
                "overall_score": 70,
                "strengths": ["Document structure appears acceptable"],
                "improvements": ["AI analysis unavailable - API key not configured"],
                "suggestions": [],
                "keywords_to_add": [],
                "formatting_tips": []
            }
        prompt = f"""
        Analyze this {document_type} for an application to the following opportunity and provide improvement suggestions.
        
        Opportunity:
        - Title: {opportunity.get('title', '')}
        - Organization: {opportunity.get('organization', '')}
        - Requirements: {opportunity.get('requirements', '')}
        - Description: {opportunity.get('description', '')}
        
        {document_type.upper()}:
        {content}
        
        Provide response in JSON format:
        {{
            "overall_score": <number between 0-100>,
            "strengths": ["<strength 1>", "<strength 2>"],
            "improvements": ["<improvement 1>", "<improvement 2>"],
            "suggestions": ["<specific suggestion 1>", "<specific suggestion 2>"],
            "keywords_to_add": ["<keyword 1>", "<keyword 2>"],
            "formatting_tips": ["<tip 1>", "<tip 2>"]
        }}
        """
        
        try:
            response = self.generate_content(prompt)
            response = response.strip()
            if response.startswith('```json'):
                response = response[7:-3].strip()
            elif response.startswith('```'):
                response = response[3:-3].strip()
            
            return json.loads(response)
        except (json.JSONDecodeError, Exception) as e:
            logger.error(f"Error analyzing document: {str(e)}")
            return {
                "overall_score": 70,
                "strengths": ["Document structure looks good"],
                "improvements": ["Unable to provide detailed analysis due to technical error"],
                "suggestions": [],
                "keywords_to_add": [],
                "formatting_tips": []
            }
    
    def generate_interview_questions(self, opportunity: Dict, difficulty_level: str = "medium") -> List[str]:
        """
        Generate relevant interview questions for an opportunity
        """
        try:
            self._check_api_key()
        except ValueError:
            return [
                "Tell me about yourself and why you're interested in this role.",
                "What skills and experiences make you a good fit for this position?",
                "Describe a challenging project you've worked on.",
                "How do you handle working under pressure?",
                "Why do you want to work at our organization?"
            ]
        prompt = f"""
        Generate {10 if difficulty_level == 'easy' else 15} interview questions for this opportunity.
        Difficulty level: {difficulty_level}
        
        Opportunity:
        - Title: {opportunity.get('title', '')}
        - Organization: {opportunity.get('organization', '')}
        - Category: {opportunity.get('category', '')}
        - Requirements: {opportunity.get('requirements', '')}
        - Description: {opportunity.get('description', '')}
        
        Include a mix of:
        - Technical questions
        - Behavioral questions
        - Situational questions
        - Company-specific questions
        
        Return as JSON array: ["Question 1", "Question 2", ...]
        """
        
        try:
            response = self.generate_content(prompt)
            response = response.strip()
            if response.startswith('```json'):
                response = response[7:-3].strip()
            elif response.startswith('```'):
                response = response[3:-3].strip()
            
            return json.loads(response)
        except (json.JSONDecodeError, Exception) as e:
            logger.error(f"Error generating interview questions: {str(e)}")
            return [
                "Tell me about yourself and why you're interested in this role.",
                "What skills and experiences make you a good fit for this position?",
                "Describe a challenging project you've worked on.",
                "How do you handle working under pressure?",
                "Why do you want to work at our organization?"
            ]
    
    def summarize_forum_discussion(self, posts: List[Dict]) -> Dict:
        """
        Generate AI summary of forum discussion
        """
        try:
            self._check_api_key()
        except ValueError:
            return {
                "summary": "Discussion summary unavailable - AI service not configured",
                "key_points": [],
                "main_topics": [],
                "sentiment": "neutral",
                "action_items": [],
                "resources_mentioned": []
            }
        posts_text = "\n\n".join([
            f"Post by {post.get('author', 'Unknown')}: {post.get('content', '')}"
            for post in posts
        ])
        
        prompt = f"""
        Summarize this forum discussion and provide key insights.
        
        Discussion:
        {posts_text}
        
        Provide response in JSON format:
        {{
            "summary": "<brief summary of the discussion>",
            "key_points": ["<key point 1>", "<key point 2>"],
            "main_topics": ["<topic 1>", "<topic 2>"],
            "sentiment": "<positive/neutral/negative>",
            "action_items": ["<action 1>", "<action 2>"],
            "resources_mentioned": ["<resource 1>", "<resource 2>"]
        }}
        """
        
        try:
            response = self.generate_content(prompt)
            response = response.strip()
            if response.startswith('```json'):
                response = response[7:-3].strip()
            elif response.startswith('```'):
                response = response[3:-3].strip()
            
            return json.loads(response)
        except (json.JSONDecodeError, Exception) as e:
            logger.error(f"Error summarizing discussion: {str(e)}")
            return {
                "summary": "Discussion summary unavailable",
                "key_points": [],
                "main_topics": [],
                "sentiment": "neutral",
                "action_items": [],
                "resources_mentioned": []
            }
    
    def generate_career_insights(self, user_data: Dict, market_trends: Dict = None) -> Dict:
        """
        Generate personalized career insights and recommendations
        """
        try:
            self._check_api_key()
        except ValueError:
            return {
                "career_trajectory": "Career insights unavailable - AI service not configured",
                "strengths": [],
                "growth_areas": [],
                "skill_recommendations": [],
                "next_steps": [],
                "industry_insights": [],
                "networking_suggestions": [],
                "confidence_score": 50
            }
        prompt = f"""
        Analyze this user's profile and provide personalized career insights and recommendations.
        
        User Profile:
        - Skills: {user_data.get('skills', [])}
        - Experience: {user_data.get('experience_years', 0)} years
        - Education: {user_data.get('education', '')}
        - Career Goals: {user_data.get('career_goals', '')}
        - Recent Applications: {len(user_data.get('recent_applications', []))}
        - Activity Level: {user_data.get('activity_level', 'medium')}
        
        {f"Market Trends: {market_trends}" if market_trends else ""}
        
        Provide response in JSON format:
        {{
            "career_trajectory": "<analysis of current trajectory>",
            "strengths": ["<strength 1>", "<strength 2>"],
            "growth_areas": ["<area 1>", "<area 2>"],
            "skill_recommendations": ["<skill 1>", "<skill 2>"],
            "next_steps": ["<step 1>", "<step 2>"],
            "industry_insights": ["<insight 1>", "<insight 2>"],
            "networking_suggestions": ["<suggestion 1>", "<suggestion 2>"],
            "confidence_score": <number between 0-100>
        }}
        """
        
        try:
            response = self.generate_content(prompt)
            response = response.strip()
            if response.startswith('```json'):
                response = response[7:-3].strip()
            elif response.startswith('```'):
                response = response[3:-3].strip()
            
            return json.loads(response)
        except (json.JSONDecodeError, Exception) as e:
            logger.error(f"Error generating career insights: {str(e)}")
            return {
                "career_trajectory": "Unable to analyze at this time",
                "strengths": [],
                "growth_areas": [],
                "skill_recommendations": [],
                "next_steps": [],
                "industry_insights": [],
                "networking_suggestions": [],
                "confidence_score": 50
            }

# Singleton instance
gemini_service = GeminiService()
