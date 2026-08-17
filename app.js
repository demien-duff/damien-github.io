let allItems = [];

document.addEventListener("DOMContentLoaded", () => {
  fetchData();
});

async function fetchData() {
  try {
    const response = await fetch("data.json");
    allItems = await response.json();
    
    updateDashboard();
    filterData("activity");
    filterData("scholarship");
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการโหลดข้อมูล JSON:", error);
  }
}

// ระบบสลับหน้า 3 เมนู (Home, Activity, Scholarship)
function switchTab(tabName) {
  // ซ่อนทุกหน้า
  document.querySelectorAll(".page-view").forEach(v => v.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(btn => btn.classList.remove("active"));

  // เปิดหน้าที่เลือก
  document.getElementById(`view-${tabName}`).classList.add("active");
  document.getElementById(`nav-${tabName}`).classList.add("active");

  // เลื่อนกลับไปด้านบนสุดของหน้าเมื่อสลับหน้า
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateDashboard() {
  document.getElementById("stat-total").innerText = allItems.length;
  document.getElementById("stat-scholarships").innerText = allItems.filter(i => i.type === "scholarship").length;
  document.getElementById("stat-activities").innerText = allItems.filter(i => i.type === "activity").length;

  const featuredItems = allItems.filter(item => item.featured);
  renderCards(featuredItems, "featured-grid");
}

// กรองข้อมูลแยกตามหน้า
function filterData(type) {
  const searchInput = document.getElementById(`${type}-search`).value.toLowerCase();
  const categorySelect = document.getElementById(`${type}-category`).value;

  const filtered = allItems.filter(item => {
    const matchType = item.type === type;
    const matchSearch = item.title.toLowerCase().includes(searchInput) || item.description.toLowerCase().includes(searchInput);
    const matchCategory = (categorySelect === "all") || (item.category === categorySelect);

    return matchType && matchSearch && matchCategory;
  });

  renderCards(filtered, `${type}-grid`);
  
  const noDataEl = document.getElementById(`${type}-no-data`);
  if (noDataEl) {
    noDataEl.style.display = filtered.length === 0 ? "block" : "none";
  }
}

function renderCards(items, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  items.forEach(item => {
    const isScholarship = item.type === "scholarship";
    const badgeClass = isScholarship ? "badge-scholarship" : "badge-activity";
    const badgeText = isScholarship ? "🎓 ทุนการศึกษา" : "🚩 กิจกรรม";
    
    // --- 🔍 จุดเช็คว่ามีรูปจริงไหม ---
    const hasImage = Boolean(item.image && item.image.trim() !== "");
    
    // กำหนด Class และ HTML โครงสร้างรูปภาพ
    const cardClass = hasImage ? "card" : "card no-image";
    const imageHTML = hasImage ? `<img src="${item.image}" alt="${item.title || ''}" class="card-img">` : "";

    const card = document.createElement("div");
    card.className = cardClass;
    card.onclick = () => openModal(item);

    card.innerHTML = `
      <img src="${item.image}" alt="${item.title}" class="card-img">
      <div class="card-content">
        <span class="badge ${badgeClass}">${badgeText} • ${item.category}</span>
        <h3 class="card-title">${item.title}</h3>
        <p class="card-desc">${item.description.substring(0, 70)}...</p>
      </div>
    `;

    container.appendChild(card);
  });
}

function openModal(item) {
  document.getElementById("modal-img").src = item.image;
  document.getElementById("modal-title").innerText = item.title;
  document.getElementById("modal-desc").innerText = item.description;
  document.getElementById("modal-deadline").innerText = item.deadline;

  const badge = document.getElementById("modal-badge");
  badge.className = `badge ${item.type === "scholarship" ? "badge-scholarship" : "badge-activity"}`;
  badge.innerText = item.type === "scholarship" ? "ทุนการศึกษา" : "กิจกรรม";

  const tagsContainer = document.getElementById("modal-tags");
  tagsContainer.innerHTML = item.tags.map(tag => `<span class="tag-pill">#${tag}</span>`).join("");

  const linkBtn = document.getElementById("modal-link");

  if (item.link) {
    linkBtn.href = item.link;
    linkBtn.style.display = "inline-flex";
    if (item.type === "scholarship") {
      linkBtn.innerHTML = "รายละเอียดต้นทางทุน";
    } else {
      linkBtn.innerHTML = "รายละเอียดต้นทางกิจกรรม";
    }
  } else {
    linkBtn.style.display = "none";
  }

  document.getElementById("item-modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("item-modal").style.display = "none";
}