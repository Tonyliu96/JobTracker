CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    auth_provider VARCHAR(255) NOT NULL DEFAULT 'PASSWORD'
);

CREATE TABLE IF NOT EXISTS applications (
    id BIGSERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    joburl VARCHAR(255),
    location VARCHAR(255),
    source VARCHAR(255),
    status VARCHAR(255) NOT NULL,
    applied_date DATE,
    notes TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    user_id BIGINT,
    follow_up_date DATE,
    reminder_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    reminde_at DATE,
    last_notified_at DATE
);

CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    application_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(255) NOT NULL,
    read BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    read_at TIMESTAMP
);
