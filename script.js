const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById("registrationForm");
const message = document.getElementById("message");

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  message.textContent = "Submitting...";

  const formData = new FormData(form);
  const selectedCourses = Array.from(
    document.querySelectorAll('input[name="courses"]:checked')
  ).map((course) => course.value);

  if (selectedCourses.length === 0) {
    message.textContent = "Please select at least one course.";
    return;
  }

  const registration = {
    full_name: formData.get("full_name"),
    student_id: formData.get("student_id"),
    email: formData.get("email"),
    major: formData.get("major"),
    course: selectedCourses.join(", "),
    section: formData.get("section"),
    year_level: formData.get("year_level"),
    agreement: document.getElementById("agreement").checked,
  };

  const { error } = await client.from("registrations").insert([registration]);

  if (error) {
    console.error(error);
    message.textContent = "Registration failed. Please check your Supabase setup.";
  } else {
    message.textContent = "Registration submitted successfully!";
    form.reset();
  }
});
