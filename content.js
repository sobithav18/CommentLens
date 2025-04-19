console.log("✅ content.js loaded");

const urlParams = new URLSearchParams(window.location.search);
const videoId = urlParams.get("v");
const currentVideoId = videoId; // ✅ Added to fix ReferenceError

console.log("📹 Extracted Video ID:", videoId);

if (videoId) {
  console.log(`📡 Sending request to Flask backend for videoId=${videoId}`);
  fetch(`http://127.0.0.1:5001/comments?videoId=${videoId}`)
    .then(response => {
      console.log("📨 Response received from Flask");
      return response.json();
    })
    .then(data => {
      console.log("📦 Parsed response JSON:", data);
      if (data.comments) {
        displayComments(data.comments);
      } else {
        console.error("❌ Error fetching comments:", data.error);
      }
    })
    .catch(error => console.error("⚠️ Fetch error:", error));
} else {
  console.warn("⚠️ No videoId found in URL.");
}

function displayComments(comments) {
  console.log("📝 Displaying comments...");
  
  const commentsContainer = document.createElement("div");
  commentsContainer.id = "comments-container";

  // Styling to blend with YouTube page
  commentsContainer.style.position = "absolute";
  commentsContainer.style.bottom = "100px";  // Adjust this to fit the layout better
  commentsContainer.style.right = "20px";  // Right of the page
  commentsContainer.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
  commentsContainer.style.maxHeight = "300px";
  commentsContainer.style.overflowY = "auto";
  commentsContainer.style.padding = "10px";
  commentsContainer.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
  commentsContainer.style.borderRadius = "8px";
  commentsContainer.style.zIndex = 99999;

  document.body.appendChild(commentsContainer);

  comments.forEach(commentData => {
    const commentDiv = document.createElement("div");
    commentDiv.className = "comment";
    commentDiv.style.marginBottom = "8px";

    const commentText = document.createElement("span");
    commentText.textContent = commentData.comment;

    const sentimentText = document.createElement("span");
    sentimentText.textContent = ` (${commentData.sentiment})`;
    sentimentText.style.fontWeight = "bold";
    sentimentText.style.color = commentData.sentiment === "Negative" ? "red" : "green";
    sentimentText.style.marginLeft = "10px";

    commentDiv.appendChild(commentText);
    commentDiv.appendChild(sentimentText);

    if (commentData.sentiment === "Negative") {
      commentDiv.style.filter = "blur(5px)";
    }

    commentsContainer.appendChild(commentDiv);
  });

  console.log("✅ Comments added to the page");
}

// Optional: handle messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("📩 Received message from popup:", request);
  if (request.action === "filterComments") {
    const comments = document.querySelectorAll(".comment");
    comments.forEach(comment => {
      if (comment.textContent.includes("bad") || comment.textContent.includes("hate")) {
        comment.style.filter = "blur(5px)";
      }
    });
    console.log("🔍 Filtered comments based on keywords");
  }
});

// 🧭 Handle dynamic URL change on YouTube (SPA behavior)
setInterval(() => {
  const newVideoId = new URLSearchParams(window.location.search).get("v");
  if (newVideoId !== currentVideoId) {
    console.log("🔄 Video ID changed! Reloading content script...");
    location.reload(); // Reload to re-fetch and re-run script
  }
}, 2000);
