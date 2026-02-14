const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const formTitle = document.getElementById("formTitle");
const errorMsg = document.getElementById("errorMsg");
const notyf = new Notyf();

function showRegister() {
  loginForm.classList.add("hidden");
  registerForm.classList.remove("hidden");
  formTitle.innerText = "Register";
  errorMsg.style.display = "none";
}

function showLogin() {
  registerForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
  formTitle.innerText = "Login";
  errorMsg.style.display = "none";
}

loginForm.addEventListener("submit", async function (e) {
  try {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!email || !password) {
      showError("Please enter email and password.");
      return;
    }

    const responseObj = await fetch(
      "http://localhost:5116/api/Authentication/login",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      },
    );

    const javascriptResponeObj = await responseObj.json();
    if (!responseObj.ok && javascriptResponeObj) {
      if (javascriptResponeObj.remainingLoginAttempts) {
        showError(
          `${javascriptResponeObj.message}. You have ${javascriptResponeObj.remainingLoginAttempts} attempts left.`,
        );
      } else {
        showError(
          javascriptResponeObj.message || "Login failed. Please try again.",
        );
      }
      throw new Error(javascriptResponeObj.message);
    }

    console.log(javascriptResponeObj.data.accessToken);
    console.log(javascriptResponeObj.data.accessTokenExpires);

    localStorage.setItem("accessToken", javascriptResponeObj.data.accessToken);
    // localStorage.setItem("tokenExpiry", res.data.accessTokenExpires);
    // localStorage.setItem("user",JSON.stringify(res.data.user));
    notyf.success("Login successful!");
    setTimeout(function(){
      window.location.href = "/Home.html";
    }, 1000);
  } catch (err) {
    console.error("Error during login:", err);
    notyf.error("Something went wrong. Please try again.");
  }
});

registerForm.addEventListener("submit", function (e) {
  debugger;
  e.preventDefault();
  const firstName = document.getElementById("regFirstName").value.trim();
  const middleNameInput = document.getElementById("regMiddleName");
  const middleName = middleNameInput?.value.trim();
  const lastNameInput = document.getElementById("regLastName");
  const lastName = lastNameInput?.value.trim();

  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value;
  const confirmPassword = document.getElementById("regConfirmPassword").value;

  if (password !== confirmPassword) {
    showError("Passwords do not match.");
    return;
  }

  fetch("http://localhost:5116/api/Authentication/register", {
    method: "POST",
    credentials: "include",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      firstName: firstName,
      middleName: middleName,
      lastName: lastName,
      email: email,
      password: password,
    }),
  })
    .then((res) => {
      if (!res.ok) {
        return res.json().then((err) => {
          throw err;
        });
      }
      return res.json();
    })
    .then((res) => {
      console.log("Registration successful:", res);
      notyf.success("Registration successful!");
      showLogin();
    })
    .catch((err) => {
      console.error("Error during registration:", err);
      notyf.error("Registration failed. Please try again.");
    });
});

function showError(message) {
  errorMsg.innerText = message;
  errorMsg.style.display = "block";
}
