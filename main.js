document.addEventListener("DOMContentLoaded", function () {
  const themeToggleButton = document.getElementById("themeToggleButton");
  const languageSwitcher = document.getElementById("languageSwitcher");
  const searchBar = document.getElementById("searchBar");
  const sortNewestButton = document.getElementById("sortNewest");
  const sortOldestButton = document.getElementById("sortOldest");
  const body = document.body;
  const contentDiv = document.getElementById("content");

  let currentUser = null;
  let posts = [];
  let selectedLanguage = localStorage.getItem("language") || "en";

  function applyTheme(theme) {
    if (theme === "dark") {
      body.classList.add("dark-theme");
      body.classList.remove("light-theme");
    } else {
      body.classList.add("light-theme");
      body.classList.remove("dark-theme");
    }
  }

  function applyLanguage(language) {
    selectedLanguage = language;
    if (language === "ka") {
      document.documentElement.lang = "ka";
      document.querySelector(
        ".navbar-left span"
      ).textContent = `მომხმარებელი: ${
        currentUser ? `${currentUser.name} ${currentUser.surname}` : ""
      }`;
      document.getElementById("logoutButton").textContent = "გასვლა";
      document.querySelector(".sidebar h2").textContent = "ახალი პოსტის შექმნა";
      document.querySelector("label[for='postTitle']").textContent = "სათაური:";
      document.querySelector("label[for='postContent']").textContent =
        "შინაარსი:";
      document.querySelector("button[type='submit']").textContent =
        "პოსტის შექმნა";
      document.querySelectorAll(".post .author").forEach((element) => {
        element.textContent = "ავტორი: ";
      });
    } else {
      document.documentElement.lang = "en";
      document.querySelector(".navbar-left span").textContent = `User: ${
        currentUser ? `${currentUser.name} ${currentUser.surname}` : ""
      }`;
      document.getElementById("logoutButton").textContent = "Logout";
      document.querySelector(".sidebar h2").textContent = "Create a New Post";
      document.querySelector("label[for='postTitle']").textContent = "Title:";
      document.querySelector("label[for='postContent']").textContent =
        "Content:";
      document.querySelector("button[type='submit']").textContent =
        "Create Post";
      document.querySelectorAll(".post .author").forEach((element) => {
        element.textContent = "Author: ";
      });
    }
  }

  const savedTheme = localStorage.getItem("theme") || "light";
  applyTheme(savedTheme);

  applyLanguage(selectedLanguage);
  languageSwitcher.value = selectedLanguage;

  themeToggleButton.addEventListener("click", function () {
    const currentTheme = body.classList.contains("dark-theme")
      ? "dark"
      : "light";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  });

  languageSwitcher.addEventListener("change", function () {
    const selectedLanguage = languageSwitcher.value;
    applyLanguage(selectedLanguage);
    localStorage.setItem("language", selectedLanguage);
  });

  function fetchUserDetails(token) {
    axios
      .get("https://training-api-three.vercel.app/api/user", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Accept-Language": selectedLanguage,
        },
      })
      .then((response) => {
        currentUser = response.data;
        applyLanguage(selectedLanguage);
        document.getElementById(
          "userName"
        ).textContent = `${currentUser.name} ${currentUser.surname}`;
        document.getElementById("logoutButton").style.display = "block";
        fetchPosts(token);
      })
      .catch((error) => {
        console.error("Error fetching user info:", error);
        window.location.href = "login.html";
      });
  }

  const token = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  if (token) {
    fetchUserDetails(token);
  } else if (refreshToken) {
    refreshAccessToken(refreshToken);
  } else {
    window.location.href = "login.html";
  }

  function refreshAccessToken(refreshToken) {
    axios
      .get("https://training-api-three.vercel.app/api/token", {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
          "Accept-Language": selectedLanguage,
        },
      })
      .then((response) => {
        const newToken = response.data.accessToken;
        localStorage.setItem("accessToken", newToken);
        fetchUserDetails(newToken);
      })
      .catch((error) => {
        console.error("Error refreshing access token:", error);
        window.location.href = "login.html";
      });
  }

  logoutButton.addEventListener("click", function () {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    document.getElementById("content").innerHTML = "You have been logged out.";
    document.getElementById("logoutButton").style.display = "none";
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
  });

  document
    .getElementById("postForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      const title = document.getElementById("postTitle").value;
      const content = document.getElementById("postContent").value;
      const token = localStorage.getItem("accessToken");

      axios
        .post(
          "https://training-api-three.vercel.app/api/post",
          {
            title: title,
            content: content,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Accept-Language": selectedLanguage,
            },
          }
        )
        .then((response) => {
          alert("Post created successfully");
          document.getElementById("postTitle").value = "";
          document.getElementById("postContent").value = "";
          fetchPosts(token);
        })
        .catch((error) => {
          console.error("Error creating post:", error);
          alert("Error creating post. Please try again later.");
        });
    });

  function fetchPosts(token) {
    axios
      .get(
        "https://training-api-three.vercel.app/api/post/feed?page=1&perPage=2000",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Accept-Language": selectedLanguage,
          },
        }
      )
      .then((response) => {
        posts = response.data.posts;
        renderPosts(posts);
      })
      .catch((error) => {
        console.error("Error fetching posts:", error);
      });
  }

  function renderPosts(posts) {
    contentDiv.innerHTML = "";
    posts.forEach((post) => {
      const postElement = document.createElement("div");
      postElement.className = "post";
      postElement.dataset.userId = post.author._id;
      postElement.dataset.postId = post._id;

      const createdAt = new Date(post.createdAt).toLocaleString();

      postElement.innerHTML = `
        <h3>${post.title}</h3>
        <p>${post.content}</p>
        <p>Author: ${post.author.name} ${post.author.surname}</p>
        <p id="created-at">Created At: ${createdAt}</p>
        <div class="post-actions">
          <p>Likes: <span class="like-count">${post.likes}</span> <button class="like-post" data-post-id="${post._id}">Like</button></p>
          <p>Dislikes: <span class="dislike-count">${post.dislikes}</span> <button class="dislike-post" data-post-id="${post._id}">Dislike</button></p>
        </div>
        <button class="delete-post" data-post-id="${post._id}">Delete</button>
      `;
      if (post.author._id === currentUser._id) {
        postElement.querySelector(".delete-post").style.display = "block";
      } else {
        postElement.querySelector(".delete-post").style.display = "none";
      }
      contentDiv.appendChild(postElement);
    });
  }

  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("delete-post")) {
      const postId = event.target.dataset.postId;
      if (confirm("Are you sure you want to delete this post?")) {
        deletePost(postId);
      }
    } else if (event.target.classList.contains("like-post")) {
      const postId = event.target.dataset.postId;
      updateReactionCount(postId, "like");
      reactToPost(postId, "like");
    } else if (event.target.classList.contains("dislike-post")) {
      const postId = event.target.dataset.postId;
      updateReactionCount(postId, "dislike");
      reactToPost(postId, "dislike");
    }
  });

  function deletePost(postId) {
    const token = localStorage.getItem("accessToken");

    axios
      .delete(`https://training-api-three.vercel.app/api/post/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Accept-Language": selectedLanguage,
        },
      })
      .then((response) => {
        alert("Post deleted successfully");
        fetchPosts(token);
      })
      .catch((error) => {
        console.error("Error deleting post:", error);
        alert("Error deleting post. Please try again later.");
      });
  }

  function updateReactionCount(postId, reactionType) {
    const postElement = document.querySelector(`[data-post-id="${postId}"]`);
    const likeCountElement = postElement.querySelector(".like-count");
    const dislikeCountElement = postElement.querySelector(".dislike-count");
    let likeCount = parseInt(likeCountElement.textContent, 10);
    let dislikeCount = parseInt(dislikeCountElement.textContent, 10);

    if (reactionType === "like") {
      likeCountElement.textContent = likeCount + 1;
    } else if (reactionType === "dislike") {
      dislikeCountElement.textContent = dislikeCount + 1;
    }
  }

  function reactToPost(postId, reactionType) {
    const token = localStorage.getItem("accessToken");

    axios
      .post(
        "https://training-api-three.vercel.app/api/reaction",
        {
          postId,
          reaction: reactionType,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Accept-Language": selectedLanguage,
          },
        }
      )
      .then((response) => {
        fetchPosts(token);
      })
      .catch((error) => {
        console.error(`Error ${reactionType} post:`, error);
        alert(`Error ${reactionType} post. Please try again later.`);
      });
  }

  sortNewestButton.addEventListener("click", function () {
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    renderPosts(posts);
  });

  sortOldestButton.addEventListener("click", function () {
    posts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    renderPosts(posts);
  });

  searchBar.addEventListener("input", function () {
    const searchTerm = searchBar.value.toLowerCase();
    const filteredPosts = posts.filter((post) =>
      `${post.author.name} ${post.author.surname}`
        .toLowerCase()
        .includes(searchTerm)
    );
    renderPosts(filteredPosts);
  });
});
