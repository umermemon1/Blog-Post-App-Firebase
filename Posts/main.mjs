import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, orderBy, limit, startAfter } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { app } from "../firebase.mjs";

const db = getFirestore(app);
const result = document.querySelector(".result");
const createBtn = document.getElementById("createBtn");
const PAGE_SIZE = 20;

let lastDoc = null;
let hasMore = false;
let currentUserEmail = "";

const formatDate = (timestamp) =>
  new Intl.DateTimeFormat("en-US", {
    year: "numeric", month: "long", day: "numeric",
    hour: "numeric", minute: "2-digit", second: "2-digit"
  }).format(new Date(timestamp));

const showError = (message) => {
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.textContent = message;
  result.prepend(errorDiv);
  setTimeout(() => errorDiv.remove(), 5000);
};

const showSuccess = (message) => {
  const successDiv = document.createElement("div");
  successDiv.className = "success-message";
  successDiv.textContent = message;
  result.prepend(successDiv);
  setTimeout(() => successDiv.remove(), 3000);
};

const buildPostCard = (post) => {
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
  dateElement.textContent = formatDate(post.createdOn);
  postCard.appendChild(dateElement);

  if (currentUserEmail && currentUserEmail === post.email) {
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

  return postCard;
};

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
    const postData = {
      title: titleInput.value.trim(),
      description: contentInput.value.trim(),
      createdOn: new Date().getTime(),
      email: user.email
    };
    const docRef = await addDoc(collection(db, "posts"), postData);
    titleInput.value = "";
    contentInput.value = "";
    showSuccess("Post published successfully!");

    // Update DOM directly — no re-fetch
    const emptyState = result.querySelector(".empty-state");
    if (emptyState) emptyState.remove();
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    const newCard = buildPostCard({ id: docRef.id, ...postData });
    result.insertBefore(newCard, result.firstChild);
    // Keep load-more button at the end if present
    if (loadMoreBtn) result.appendChild(loadMoreBtn);
  } catch (error) {
    console.error(error);
    showError("Failed to create post. Please try again.");
  } finally {
    createBtn.disabled = false;
    createBtn.textContent = "Publish Post";
  }
};

document.querySelector("form").addEventListener("submit", create_post);

const delete_post = async (id) => {
  if (!confirm("Are you sure you want to delete this post?")) return;

  try {
    await deleteDoc(doc(db, "posts", id));
    showSuccess("Post deleted successfully!");

    // Update DOM directly — no re-fetch
    const card = document.querySelector(`[data-id="${id}"]`);
    if (card) card.remove();

    if (!result.querySelector(".post")) {
      result.innerHTML = '<div class="empty-state"><p>No posts yet. Be the first to share something!</p></div>';
    }
  } catch (error) {
    console.error(error);
    showError("Failed to delete post.");
  }
};

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
    // updateDoc instead of setDoc so createdOn/email are preserved
    await updateDoc(doc(db, "posts", id), {
      title: newTitle.trim(),
      description: newDesc.trim()
    });
    showSuccess("Post updated successfully!");

    // Update DOM directly — no re-fetch
    titleEl.textContent = newTitle.trim();
    descEl.textContent = newDesc.trim();
  } catch (error) {
    console.error(error);
    showError("Failed to update post.");
  }
};

const get_data = async (isLoadMore = false) => {
  if (!isLoadMore) {
    result.innerHTML = '<div class="empty-state"><p>Loading posts...</p></div>';
    lastDoc = null;
  } else {
    document.getElementById("loadMoreBtn")?.remove();
  }

  try {
    const constraints = [orderBy("createdOn", "desc"), limit(PAGE_SIZE)];
    if (isLoadMore && lastDoc) constraints.push(startAfter(lastDoc));
    const q = query(collection(db, "posts"), ...constraints);
    const querySnapshot = await getDocs(q);
    const docs = querySnapshot.docs;

    if (!isLoadMore) result.innerHTML = "";

    if (docs.length === 0 && !isLoadMore) {
      result.innerHTML = '<div class="empty-state"><p>No posts yet. Be the first to share something!</p></div>';
      return;
    }

    hasMore = docs.length === PAGE_SIZE;
    if (docs.length > 0) lastDoc = docs[docs.length - 1];

    const fragment = document.createDocumentFragment();
    docs.forEach((docSnap) => {
      fragment.appendChild(buildPostCard({ id: docSnap.id, ...docSnap.data() }));
    });
    result.appendChild(fragment);

    if (hasMore) {
      const loadMoreBtn = document.createElement("button");
      loadMoreBtn.id = "loadMoreBtn";
      loadMoreBtn.textContent = "Load More Posts";
      loadMoreBtn.style.cssText = "display:block;margin:1rem auto;";
      loadMoreBtn.onclick = () => get_data(true);
      result.appendChild(loadMoreBtn);
    }
  } catch (error) {
    console.error(error);
    result.innerHTML = '<div class="error-message"><p>Failed to load posts. Please refresh.</p></div>';
  }
};

const getCurrentUser = () => {
  const auth = getAuth();
  // Unsubscribe immediately after the first auth state resolution to prevent memory leak
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    unsubscribe();
    if (user) {
      currentUserEmail = user.email;
      document.querySelector(".email").textContent = user.email;
      get_data();
    } else {
      window.location.href = "../Login/index.html";
    }
  });
};

getCurrentUser();

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
