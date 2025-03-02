import { User } from "./auth";

// In-memory user storage for local development
const users: Record<string, User> = {
  // Add a default test user
  "test-user-id": {
    id: "test-user-id",
    username: "test",
    email: null,
    password_hash: "test",
    aura_balance: 5000,
    created_at: new Date().toISOString(),
    last_login: null,
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=test",
    is_banned: false,
  },
};

// Generate a UUID
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function mockSignIn(username: string, password: string) {
  console.log("mockSignIn called with:", username, password);
  console.log(
    "Available users:",
    Object.values(users).map((u) => u.username),
  );

  // Force login with test user regardless of credentials
  const testUser = users["test-user-id"];
  testUser.last_login = new Date().toISOString();

  // Update username if provided
  if (username && username !== "test") {
    testUser.username = username;
    testUser.avatar_url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
  }

  localStorage.setItem("auradex_user", JSON.stringify(testUser));

  // Don't redirect here, let the auth context handle it
  return { user: testUser };
}

export async function mockSignUp(
  email: string | undefined,
  username: string,
  password: string,
) {
  console.log("mockSignUp called with:", username, password);

  // For testing purposes, create and auto-login with any credentials
  const userId = generateUUID();
  const newUser: User = {
    id: userId,
    username,
    email: email || null,
    password_hash: password,
    aura_balance: 1000,
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    is_banned: false,
  };

  // Store user in memory
  users[userId] = newUser;

  // Store in localStorage
  localStorage.setItem("auradex_user", JSON.stringify(newUser));

  return { user: newUser };
}

export async function mockSignOut() {
  localStorage.removeItem("auradex_user");
}

export async function mockUpdateUser(userId: string, updates: Partial<User>) {
  if (!users[userId]) {
    throw new Error("User not found");
  }

  // Update user
  users[userId] = { ...users[userId], ...updates };

  // Update localStorage if this is the current user
  const storedUser = localStorage.getItem("auradex_user");
  if (storedUser) {
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.id === userId) {
      localStorage.setItem("auradex_user", JSON.stringify(users[userId]));
    }
  }

  return users[userId];
}
