import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { app } from "../firebase.mjs";

const db = getFirestore(app);
const result = document.querySelector(".result");
const createBtn = document.getElementById("createBtn");

// Display error message
const showError = (message) => {
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.textContent = message;
  result.prepend(errorDiv);
  setTimeout(() => errorDiv.remove(), 5000);
};

// Display success message
const showSuccess = (message) => {
  const successDiv = document.createElement("div");
  successDiv.className = "success-message";
  successDiv.textContent = message;
  result.prepend(successDiv);
  setTimeout(() => successDiv.remove(), 3000);
};

// Create post
const create_post = async (e) => {
  e.preventDefault();

  const titleInput = document.getElementById("postTitle");
  const contentInput = document.getElementById("postContent");

  if (!titleInput.value.trim() || !contentInput.value.trim()) {
    showError("Please fill in all fields.");
    return;
  }

  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    showError("You must be logged in to create a post.");
    return;
  }

  createBtn.disabled = true;
  createBtn.textContent = "Publishing...";

  try {
    await addDoc(collection(db, "posts"), {
      title: titleInput.value.trim(),
      description: contentInput.value.trim(),
      createdOn: new Date().getTime(),
      email: user.email
    });
    titleInput.value = "";
    contentInput.value = "";
    showSuccess("Post published successfully!");
    get_data();
  } catch (error) {
    console.error(error);
    showError("Failed to create post. Please try again.");
  } finally {
    createBtn.disabled = false;
    createBtn.textContent = "Publish Post";
  }
};

document.querySelector("form").addEventListener("submit", create_post);

// Delete post
const delete_post = async (id) => {
  if (!confirm("Are you sure you want to delete this post?")) return;

  try {
    await deleteDoc(doc(db, "posts", id));
    showSuccess("Post deleted successfully!");
    get_data();
  } catch (error) {
    console.error(error);
    showError("Failed to delete post.");
  }
};

// Edit post
const edit_post = async (id) => {
  const postCard = document.querySelector(`[data-id="${id}"]`);
  const titleEl = postCard.querySelector("h2");
  const descEl = postCard.querySelector("p");

  const newTitle = prompt("Enter new title:", titleEl.textContent);
  if (newTitle === null) return;

  const newDesc = prompt("Enter new description:", descEl.textContent);
  if (newDesc === null) return;

  if (!newTitle.trim() || !newDesc.trim()) {
    showError("Title and description cannot be empty.");
    return;
  }

  try {
    await setDoc(doc(db, "posts", id), {
      title: newTitle.trim(),
      description: newDesc.trim()
    });
    showSuccess("Post updated successfully!");
    get_data();
  } catch (error) {
    console.error(error);
    showError("Failed to update post.");
  }
};

// Get posts
const get_data = async () => {
  result.innerHTML = '<div class="empty-state"><p>Loading posts...</p></div>';

  try {
    const querySnapshot = await getDocs(collection(db, "posts"));
    const auth = getAuth();
    const user = auth.currentUser;
    const email = user ? user.email : "";
    const posts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    result.innerHTML = "";

    if (posts.length === 0) {
      result.innerHTML = '<div class="empty-state"><p>No posts yet. Be the first to share something!</p></div>';
      return;
    }

    // Sort by newest first
    posts.sort((a, b) => b.createdOn - a.createdOn);

    posts.forEach((post) => {
      const postCard = document.createElement("div");
      postCard.className = "post";
      postCard.setAttribute("data-id", post.id);

      const idElement = document.createElement("span");
      idElement.textContent = `ID: ${post.id}`;
      postCard.appendChild(idElement);

      const mailElement = document.createElement("div");
      mailElement.className = "email";
      mailElement.textContent = post.email || "Unknown";
      postCard.appendChild(mailElement);

      const h2Element = document.createElement("h2");
      h2Element.textContent = post.title;
      postCard.appendChild(h2Element);

      const pElement = document.createElement("p");
      pElement.textContent = post.description;
      postCard.appendChild(pElement);

      const dateElement = document.createElement("b");
      dateElement.textContent = moment(post.createdOn).format('MMMM Do YYYY, h:mm:ss a');
      postCard.appendChild(dateElement);

      if (email && email === post.email) {
        const btnContainer = document.createElement("div");
        btnContainer.className = "btn-group";

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit Post";
        editBtn.onclick = () => edit_post(post.id);
        btnContainer.appendChild(editBtn);

        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete Post";
        delBtn.className = "danger";
        delBtn.onclick = () => delete_post(post.id);
        btnContainer.appendChild(delBtn);

        postCard.appendChild(btnContainer);
      }

      result.appendChild(postCard);
    });

  } catch (error) {
    console.error(error);
    result.innerHTML = '<div class="error-message"><p>Failed to load posts. Please refresh.</p></div>';
  }
};

// Auth state
const getCurrentUser = () => {
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      document.querySelector(".email").textContent = user.email;
      get_data();
    } else {
      window.location.href = "../Login/index.html";
    }
  });
};

getCurrentUser();

// Logout
document.querySelector(".logout-btn").addEventListener("click", () => {
  const auth = getAuth();
  signOut(auth)
    .then(() => {
      window.location.href = "../Login/index.html";
    })
    .catch((error) => {
      console.error(error);
      showError("Failed to log out. Please try again.");
    });
});
