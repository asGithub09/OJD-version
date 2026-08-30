const API_BASE_URL = "http://127.0.0.1:5000/api";

const request = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include",
    ...options,
  });

  const data = await response.json().catch(() => ({
    success: false,
    message: "Invalid server response.",
  }));

  if (!response.ok) {
    const error = new Error(
      data.message || "Request failed."
    );

    error.status = response.status;
    error.code = data.code;

    throw error;
  }

  return data;
};

const register = async ({
  name,
  email,
  phone,
  password,
}) => {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      phone,
      password,
    }),
  });
};

const verifyEmail = async ({
  userId,
  otp,
}) => {
  return request("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({
      userId,
      otp,
    }),
  });
};

const login = async ({
  email,
  password,
}) => {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
};

export {
  register,
  verifyEmail,
  login,
};
