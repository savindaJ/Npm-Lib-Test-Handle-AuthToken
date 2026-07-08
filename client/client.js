const BASE_URL = "http://localhost:3000/auth";

async function runTests() {
  console.log("🚀 Starting API Lifecycle Tests with OwlTokenGuard...\n");

  let accessToken = "";
  let refreshToken = "";

  // 1. LOGIN TEST
  try {
    console.log("🔄 [1/5] Attempting Login...");
    const loginRes = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "password123" }),
    });

    const loginData = await loginRes.json();
    console.log("📥 Login Response:", loginData);

    if (!loginRes.ok) throw new Error("Login failed");
    
    accessToken = loginData.accessToken;
    refreshToken = loginData.refreshToken;
    console.log("✅ Login Successful! Tokens stored.\n");
  } catch (err) {
    console.error("❌ Login Test Failed:", err.message);
    return;
  }

  // 2. ACCESS PROTECTED DASHBOARD TEST
  try {
    console.log("🔄 [2/5] Fetching Protected Dashboard...");
    const dbRes = await fetch(`${BASE_URL}/dashboard`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const dbData = await dbRes.json();
    console.log("📥 Dashboard Response:", dbData);
    console.log("✅ Dashboard Access Successful!\n");
  } catch (err) {
    console.error("❌ Dashboard Test Failed:", err.message);
  }

  // 3. REFRESH TOKEN ROTATION (RTR) TEST
  let newAccessToken = "";
  let newRefreshToken = "";
  try {
    console.log("🔄 [3/5] Requesting Token Rotation (Refresh)...");
    const refreshRes = await fetch(`${BASE_URL}/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const refreshData = await refreshRes.json();
    console.log("📥 Refresh Response (OAuth Style):", refreshData);

    if (!refreshRes.ok) throw new Error("Token rotation failed");

    newAccessToken = refreshData.access_token;
    newRefreshToken = refreshData.refresh_token;
    console.log("✅ Token Rotation Successful! Old tokens consumed, new ones issued.\n");
  } catch (err) {
    console.error("❌ Refresh Test Failed:", err.message);
    return;
  }

  // 4. ACCESS DASHBOARD WITH NEW ACCESS TOKEN
  try {
    console.log("🔄 [4/5] Accessing Dashboard with NEW Access Token...");
    const newDbRes = await fetch(`${BASE_URL}/dashboard`, {
      method: "GET",
      headers: { Authorization: `Bearer ${newAccessToken}` },
    });

    const newDbData = await newDbRes.json();
    console.log("📥 New Dashboard Response:", newDbData);
    console.log("✅ Dashboard Access with New Token Successful!\n");
  } catch (err) {
    console.error("❌ New Token Dashboard Test Failed:", err.message);
  }

  // 5. LOGOUT TEST (Revocation)
  try {
    console.log("🔄 [5/5] Attempting Logout...");
    const logoutRes = await fetch(`${BASE_URL}/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: newRefreshToken }),
    });

    const logoutData = await logoutRes.json();
    console.log("📥 Logout Response:", logoutData);
    console.log("✅ Logout Successful! Session Terminated.\n");
  } catch (err) {
    console.error("❌ Logout Test Failed:", err.message);
  }

  console.log("🏁 All tests completed.");
}

runTests();