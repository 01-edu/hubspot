
CREATE TABLE user (
  -- external, imported from zone01normandie.org
  createdAt  int NOT NULL,
  login      text NOT NULL PRIMARY KEY,
  email      text NOT NULL,

  -- current step of the student onboarding
  step       text CHECK(step IN (
    'SIGNUP',
    'GAMES',
    'ADMIN',
    'PISCINE',
    'REGISTRATION'
  )) NOT NULL DEFAULT 'SIGNUP',

  -- store last notification time and step
  notifyStep text,
  notifyAt   int
);