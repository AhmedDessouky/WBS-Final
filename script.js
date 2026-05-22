const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById("registrationForm");
const formMessage = document.getElementById("formMessage");
const searchBtn = document.getElementById("searchBtn");
const searchResults = document.getElementById("searchResults");

function showMessage(text, type) {
  formMessage.textContent = text;
  formMessage.className = `message ${type}`;
}

function getSelectedCourses() {
  return Array.from(document.querySelectorAll('input[name="course"]:checked')).map(input => input.value);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  showMessage("", "");

  const selectedCourses = getSelectedCourses();

  if (selectedCourses.length === 0) {
    showMessage("Please select at least one course.", "error");
    return;
  }

  const formData = new FormData(form);
  const registration = {
    full_name: formData.get("full_name").trim(),
    student_id: formData.get("student_id").trim(),
    email: formData.get("email").trim(),
    major: formData.get("major"),
    course: selectedCourses.join(", "),
    section: formData.get("section"),
    year_level: formData.get("year_level"),
    agreement: document.getElementById("agreement").checked
  };

  const { error } = await supabaseClient.from("registrations").insert([registration]);

  if (error) {
    console.error(error);
    showMessage("Registration failed. Check Supabase policy and table columns.", "error");
    return;
  }

  showMessage("Registration submitted successfully.", "success");
  form.reset();
});

searchBtn.addEventListener("click", searchCourses);
document.getElementById("searchStudentId").addEventListener("keydown", (event) => {
  if (event.key === "Enter") searchCourses();
});

async function searchCourses() {
  const studentId = document.getElementById("searchStudentId").value.trim();
  searchResults.innerHTML = "";

  if (!studentId) {
    searchResults.innerHTML = `<p class="message error">Please enter a Student ID.</p>`;
    return;
  }

  const { data, error } = await supabaseClient
    .from("registrations")
    .select("full_name, student_id, email, major, course, section, year_level, created_at")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    searchResults.innerHTML = `<p class="message error">Search failed. Make sure the SELECT policy exists in Supabase.</p>`;
    return;
  }

  if (!data || data.length === 0) {
    searchResults.innerHTML = `<p class="message error">No registrations found for this Student ID.</p>`;
    return;
  }

  searchResults.innerHTML = data.map(row => {
    const courseTags = String(row.course || "")
      .split(",")
      .map(course => course.trim())
      .filter(Boolean)
      .map(course => `<span class="tag">${course}</span>`)
      .join("");

    return `
      <div class="result-box">
        <h4>${row.full_name}</h4>
        <p><strong>ID:</strong> ${row.student_id}</p>
        <p><strong>Major:</strong> ${row.major} | <strong>Year:</strong> ${row.year_level} | <strong>Section:</strong> ${row.section}</p>
        <div class="tags">${courseTags}</div>
      </div>
    `;
  }).join("");
}
