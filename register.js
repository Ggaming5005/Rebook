document
  .getElementById("registerForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    // Clear previous error messages
    document.querySelectorAll(".error-message").forEach((el) => {
      el.style.display = "none";
      el.textContent = "";
    });

    const userData = {
      name: document.getElementById("name").value,
      surname: document.getElementById("surname").value,
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
      repeat_password: document.getElementById("repeat_password").value,
    };

    axios
      .post("https://training-api-three.vercel.app/api/user", userData)
      .then((response) => {
        alert("Registration successful. Please log in.");
        window.location.href = "login.html";
      })
      .catch((error) => {
        console.error("Registration error:", error);
        if (error.response && error.response.data) {
          const errorData = error.response.data;
          if (errorData.errors) {
            for (const key in errorData.errors) {
              const errorMessage = errorData.errors[key].msg;
              const errorElement = document.getElementById(`${key}Error`);
              if (errorElement) {
                errorElement.textContent = errorMessage;
                errorElement.style.display = "block";
              }
            }
          } else if (errorData.error) {
            alert(`Error: ${errorData.error}`);
          } else {
            alert("Registration failed. Please try again.");
          }
        } else {
          alert("Network error. Please check your internet connection.");
        }
      });
  });

document.getElementById("loginButton").addEventListener("click", function () {
  window.location.href = "login.html";
});
