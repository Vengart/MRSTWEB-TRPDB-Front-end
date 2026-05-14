const BASE_URL = "https://localhost:7214/api";

const getHeaders = () => ({
  "Content-Type": "application/json",
  ...(localStorage.getItem("token") 
    ? { Authorization: `Bearer ${localStorage.getItem("token")}` } 
    : {})
});

// Auth
export const login = async (login: string, password: string) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ login, password })
  });
  return res.json();
};

export const register = async (login: string, password: string, email: string) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ login, password, email })
  });
  return res.json();
};

// GameSessions
export const getSessions = async () => {
  const res = await fetch(`${BASE_URL}/gamesessions`, { headers: getHeaders() });
  return res.json();
};

export const getSessionById = async (id: number) => {
  const res = await fetch(`${BASE_URL}/gamesessions/${id}`, { headers: getHeaders() });
  return res.json();
};

export const createSession = async (session: object) => {
  const res = await fetch(`${BASE_URL}/gamesessions`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(session)
  });
  return res.json();
};

// GameCards
export const getCards = async () => {
  const res = await fetch(`${BASE_URL}/gamecards`, { headers: getHeaders() });
  return res.json();
};

export const createCard = async (card: object) => {
  const res = await fetch(`${BASE_URL}/gamecards`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(card)
  });
  return res.json();
};

// Applications
export const createApplication = async (application: object) => {
  const res = await fetch(`${BASE_URL}/applications`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(application)
  });
  return res.json();
};