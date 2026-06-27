CREATE TABLE budgets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    limit_amount DECIMAL(38, 2) NOT NULL,
    spent_amount DECIMAL(38, 2) NOT NULL DEFAULT 0,
    month INT NOT NULL,
    year INT NOT NULL,
    user_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
