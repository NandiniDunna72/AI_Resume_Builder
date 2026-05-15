-- Updated Database Schema based on Application structure

-- Drop existing tables to start fresh with new design
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS education;
DROP TABLE IF EXISTS experiences;
DROP TABLE IF EXISTS resumes;
DROP TABLE IF EXISTS summary_history;
DROP TABLE IF EXISTS resume_history;
DROP TABLE IF EXISTS users;

-- 1. Users Table
CREATE TABLE users (
    email VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Resume History Table
CREATE TABLE resume_history (
    id BIGINT PRIMARY KEY, -- Unique UNIX timestamp identifier
    user_email VARCHAR(255) REFERENCES users(email) ON DELETE CASCADE,
    title VARCHAR(255),
    date VARCHAR(255),
    data JSONB NOT NULL, -- Blob containing fullName, skills, experience, projects, education
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Meeting Transcripts & Summaries Table
CREATE TABLE summary_history (
    id BIGINT PRIMARY KEY, -- Unique UNIX timestamp identifier
    user_email VARCHAR(255) REFERENCES users(email) ON DELETE CASCADE,
    url TEXT,
    language VARCHAR(100),
    text TEXT, -- Markdown content
    date VARCHAR(255)
);
