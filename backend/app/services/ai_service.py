"""
Mock AI service functions that simulate AI processing

These functions include artificial delays and occasional failures to simulate 
the behavior of real AI services in production.
"""

import asyncio
import random
from typing import List, Dict, Any

from app.models.schemas import KeyInsight


async def extract_text_from_document(file_content: bytes) -> str:
    """
    Simulates extracting text from a document file (PDF, DOCX, etc.)

    Args:
        file_content: Raw bytes of the uploaded file

    Returns:
        Extracted text as a string

    Raises:
        Exception: Randomly simulates extraction failures (~5% of calls)
    """
    # Simulate processing time (1-2 seconds)
    await asyncio.sleep(random.uniform(1, 2))

    # Simulate occasional extraction errors
    if random.random() < 0.05:  # 5% chance of error
        raise Exception(
            "Failed to extract text from document: Service temporarily unavailable"
        )

    # Generate random document text
    sample_text = """
    This document outlines our company strategy for the upcoming quarter.
    Key initiatives include product development, market expansion, and customer retention.
    Our team will focus on delivering high-quality solutions while maintaining operational efficiency.
    We plan to leverage artificial intelligence to enhance our product offerings.
    """

    # Generate some random text to simulate a larger document
    paragraphs = []
    topics = [
        "AI technology",
        "market analysis",
        "product development",
        "customer feedback",
        "operational metrics",
        "strategic goals",
    ]

    for _ in range(random.randint(5, 15)):
        topic = random.choice(topics)
        paragraph = f"Our analysis of {topic} shows promising results. "
        paragraph += (
            f"The team has made significant progress in understanding {topic}. "
        )
        paragraph += f"We recommend further investment in {topic} to maximize returns."
        paragraphs.append(paragraph)

    result_text = sample_text + "\n\n" + "\n\n".join(paragraphs)
    return result_text


async def analyze_text_chunk(text: str) -> Dict[str, Any]:
    """
    Simulates analyzing a chunk of text with an AI model

    Args:
        text: The text chunk to analyze

    Returns:
        A dictionary of analysis results

    Raises:
        Exception: Randomly simulates API failures (~8% of calls)
    """
    # Simulate varying AI processing time (1-4 seconds)
    await asyncio.sleep(random.uniform(1, 4))

    # Simulate occasional AI service errors
    if random.random() < 0.08:  # 8% chance of error
        raise Exception("AI analysis failed: Model service temporarily unavailable")

    # Randomly generate analysis results
    words = text.split()
    word_count = len(words)

    # Some random metrics
    sentiment_score = random.uniform(-1.0, 1.0)
    topics = random.sample(
        [
            "technology",
            "business",
            "strategy",
            "marketing",
            "development",
            "analytics",
            "finance",
            "operations",
        ],
        k=min(3, random.randint(1, 3)),
    )

    return {
        "word_count": word_count,
        "sentiment_score": sentiment_score,
        "topics": topics,
    }


async def extract_key_insights(text: str, count: int = 5) -> List[KeyInsight]:
    """
    Simulates extracting key insights from text using an AI model

    Args:
        text: The full document text
        count: Number of insights to extract

    Returns:
        List of KeyInsight objects

    Raises:
        Exception: Randomly simulates insight extraction failures (~5% of calls)
    """
    # Simulate AI processing time (2-4 seconds)
    await asyncio.sleep(random.uniform(2, 4))

    # Simulate occasional errors
    if random.random() < 0.05:  # 5% chance of error
        raise Exception("Failed to extract insights: ML pipeline error")

    # Generate random insights based on common business topics
    potential_insights = [
        (
            "Our analysis indicates a 27% growth opportunity in the Asian market",
            "market",
        ),
        (
            "Customer feedback suggests a need for more intuitive user interfaces",
            "product",
        ),
        (
            "Operational costs could be reduced by 15% through process automation",
            "operations",
        ),
        (
            "Competitor analysis shows a gap in the premium segment we could exploit",
            "strategy",
        ),
        (
            "Data suggests our marketing spend is most effective on social platforms",
            "marketing",
        ),
        (
            "Team productivity increased 22% after implementing agile methodologies",
            "operations",
        ),
        (
            "Product usage metrics show feature X is underutilized by 78% of users",
            "product",
        ),
        (
            "Security assessments identified 3 critical vulnerabilities to address",
            "technology",
        ),
        (
            "Research indicates expanding our API offerings could create new revenue streams",
            "technology",
        ),
        (
            "User retention improves 35% when onboarding includes interactive tutorials",
            "product",
        ),
        (
            "Analysis of support tickets reveals documentation gaps in advanced features",
            "support",
        ),
        (
            "ROI on cloud infrastructure is 40% higher than maintaining on-premise systems",
            "technology",
        ),
    ]

    # Select random insights
    selected_insights = random.sample(
        potential_insights, min(count, len(potential_insights))
    )

    # Convert to KeyInsight objects
    results = []
    for text, category in selected_insights:
        insight = KeyInsight(
            text=text, confidence=random.uniform(0.7, 0.98), category=category
        )
        results.append(insight)

    return results
