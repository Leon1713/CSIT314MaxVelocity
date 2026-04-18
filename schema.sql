CREATE DATABASE IF NOT EXISTS fundraising_db;
USE fundraising_db;
 
-- ============================================================
-- USER ROLES 

CREATE TABLE IF NOT EXISTS user_roles (
    role_id     INT PRIMARY KEY AUTO_INCREMENT,
    role_name   VARCHAR(50) NOT NULL UNIQUE,  -- 'user_admin', 'fund_raiser', 'donee', 'platform_mgmt'
    description VARCHAR(255)
);
 
INSERT INTO user_roles (role_name, description) VALUES
    ('user_admin',      'Manages user accounts and system access'),
    ('fund_raiser',     'Creates and manages fundraising activities'),
    ('donee',           'Searches and donates to fundraising activities'),
    ('platform_mgmt',   'Manages FRA categories and generates reports');
 
-- ============================================================
-- USER ACCOUNTS 

CREATE TABLE IF NOT EXISTS user_accounts (
    user_id         INT PRIMARY KEY AUTO_INCREMENT,
    username        VARCHAR(50) COLLATE utf8mb4_bin  NOT NULL UNIQUE, -- case-sensitive username
    email           VARCHAR(100) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,          -- argon2id hashed
    role_id         INT          NOT NULL,
    first_name      VARCHAR(50),
    last_name       VARCHAR(50),
    phone           VARCHAR(20),
    is_active       BOOLEAN DEFAULT TRUE,
    is_suspended    BOOLEAN DEFAULT FALSE,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login      DATETIME,
    FOREIGN KEY (role_id) REFERENCES user_roles(role_id)
);
 
-- ============================================================
-- USER SESSIONS (for login/logout tracking)

CREATE TABLE IF NOT EXISTS user_sessions (
    session_id      VARCHAR(255) PRIMARY KEY,
    user_id         INT          NOT NULL,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at      DATETIME NOT NULL,
    ip_address      VARCHAR(45),
    is_active       BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES user_accounts(user_id)
);
 
-- ============================================================
-- USER PROFILES (Extended info per role)

CREATE TABLE IF NOT EXISTS user_profiles (
    profile_id      INT PRIMARY KEY AUTO_INCREMENT,
    user_id         INT NOT NULL UNIQUE,
    bio             TEXT,
    profile_picture VARCHAR(255),
    address         VARCHAR(255),
    city            VARCHAR(100),
    country         VARCHAR(100),
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_accounts(user_id)
);
 
-- ============================================================
-- SEED: Default Admin Account (password: Admin@1234)

INSERT INTO user_accounts (username, email, password_hash, role_id, first_name, last_name, is_active)
VALUES (
    'admin',
    'admin@fundraise.com',
    '$argon2id$v=19$m=65536,t=3,p=4$lnJuDaEUonSu1fpfK8XYGw$IcI5Dlf55HDZBtezKotgOI5Rf25hJIAEAVk3LNyUSWU',  -- Admin@1234 argon2id hash
    1,
    'System',
    'Admin',
    TRUE
);
