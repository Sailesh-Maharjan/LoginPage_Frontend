async function refreshAccessToken() {
  try {
    const responseObj = await fetch("http://localhost:5116/api/refresh-token", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      }
    });
    const javascriptObj = await responseObj.json();

    if (!responseObj.ok) {
      throw new Error(javascriptObj.message);
    }

    localStorage.setItem("accessToken", javascriptObj.data.accessToken);
    return true;
  } catch (error) {
    console.error("Error refreshing access token:", error.message);
    return false;
  }
}

async function revokeToken() {
  try {
    localStorage.removeItem("accessToken");
    const responseObj = await fetch("http://localhost:5116/api/revoke-token", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      }
    });
    const javascriptResponseObj = await responseObj.json();
    if (!responseObj.ok) {
      throw new Error(javascriptResponseObj.message);
    }
    console.log(javascriptResponseObj.message);
    window.location.href = "/LoginIndex.html";
  } catch (err) {
    console.error("error revoking token", err.message);
  }
}

async function fetchWrapper(url, options = {}, retry = true) {
  try {
    const accessToken = localStorage.getItem("accessToken");
    options.credentials = "include";
    options.headers = {
      "Content-Type": "application/json",
    };

    if (accessToken) {
      options.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const responseObj = await fetch(url, options);

    if (responseObj.status == 401 && retry) {
      console.log("Access token expired. Attempting refresh...");
      const refreshed = await refreshAccessToken();

      if (refreshed) {
        console.log("Token refreshed. Retrying original request...");
        return fetchWrapper(url, options, false); // retry once
      } else {
         await revokeToken();
        throw new Error("Session expired. Please login again.");
      }
    }

    if (!responseObj.ok) {
      const error = await responseObj.json();
      throw error;
    }

    return await responseObj.json();
  } catch (err) {
    console.error("API Error:", err);
    throw err;
  }
}
