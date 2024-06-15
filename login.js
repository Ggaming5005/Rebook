document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const errorMessage = document.getElementById("errorMessage");

  axios
    .post("https://training-api-three.vercel.app/api/login", {
      email,
      password,
    })
    .then((response) => {
      const { accessToken, refreshToken, expiresIn } = response.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      window.location.href = "index.html";
    })
    .catch((error) => {
      console.error("Login error:", error);
      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage.textContent = "ელ.ფოსტა ან პაროლი არასწორია";
            break;
          case 500:
            errorMessage.textContent = "სერვერზე დაფიქრსირდა შეცდომა";
            break;
          default:
            errorMessage.textContent =
              "დაფიქრსირდა დაუდგენელი შეცდომა. გთხოვთ სცადოთ მოგვიანებით.";
        }
      } else {
        errorMessage.textContent =
          "ქსელის შეცდომა. გთხოვთ შეამოწმოთ თქვენი ინტერნეტ კავშირი.";
      }
    });
});

document
  .getElementById("registerButton")
  .addEventListener("click", function () {
    window.location.href = "register.html";
  });
