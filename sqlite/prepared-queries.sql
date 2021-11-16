-- ⚡ selectUser
SELECT
  createdAt,
  login,
  email,
  step,
  notifyStep,
  notifyAt
FROM user
WHERE login = ?

-- ⚡ selectMail
SELECT
  email
FROM user
WHERE login = ?

-- ⚡ selectLastCreatedAt
SELECT
  createdAt
FROM user
ORDER BY createdAt DESC
LIMIT 1

-- ⚡ insertUser
INSERT INTO user
  (createdAt, login, email)
VALUES
  (?, ?, ?)
