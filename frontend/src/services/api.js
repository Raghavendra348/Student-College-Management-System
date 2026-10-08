const API_BASE_URL = "http://localhost:5000/api";

export const DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Electronics & Communication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Data Science & AI",
];

export const COURSES = ["B.Tech", "B.E.", "M.Tech", "B.Sc", "M.Sc", "BCA", "MCA"];

export const getDepartments = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/departments`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (response.ok) {
      const data = await response.json();
      if (data && data.departments && data.departments.length > 0) {
        return data;
      }
    }
  } catch {
    // fallback
  }
  return {
    success: true,
    departments: DEPARTMENTS.map((d) => ({ id: d, name: d })),
  };
};

export const getCourses = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (response.ok) {
      const data = await response.json();
      if (data && data.courses && data.courses.length > 0) {
        return data;
      }
    }
  } catch {
    // fallback
  }
  return {
    success: true,
    courses: COURSES.map((c) => ({ id: c, name: c })),
  };
};

// ==========================================
// TOKEN
// ==========================================

export const getToken = () => {
  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("accessToken") ||
    sessionStorage.getItem("token")
  );
};

// ==========================================
// HEADERS
// ==========================================

export const getHeaders = () => {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
};

// ==========================================
// RESPONSE HANDLER
// ==========================================

const handleResponse = async (response) => {
  let data;
  try {
    data = await response.json();
  } catch {
    data = { message: "Server communication error" };
  }

  if (response.status === 401) {
    // Clear storage on invalid/expired token if not already on login/public page
    if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/signup") && !window.location.pathname.includes("/forgot-password") && !window.location.pathname.includes("/reset-password")) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("currentUser");
      window.location.href = "/login?expired=true";
    }
  }

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

// ==========================================
// AUTH APIS
// ==========================================

export const registerCollege = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  return handleResponse(response);
};

export const loginApi = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  return handleResponse(response);
};

export const forgotPasswordApi = async (data) => {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const resetPasswordApi = async (data) => {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const getProfileApi = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const updateProfileApi = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(formData),
  });
  return handleResponse(response);
};

// ==========================================
// DASHBOARD APIS
// ==========================================

export const getDashboardStats = async () => {
  const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// ==========================================
// STUDENT APIS
// ==========================================

export const getStudents = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.status && params.status !== "All") {
    queryParams.append("status", params.status);
  }
  if (params.search) {
    queryParams.append("search", params.search);
  }

  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/students${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getStudentById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/students/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const createStudent = async (studentData) => {
  const response = await fetch(`${API_BASE_URL}/students`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(studentData),
  });
  return handleResponse(response);
};

export const updateStudent = async (id, studentData) => {
  const response = await fetch(`${API_BASE_URL}/students/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(studentData),
  });
  return handleResponse(response);
};

export const deleteStudent = async (id) => {
  const response = await fetch(`${API_BASE_URL}/students/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// ==========================================
// SUBJECT APIS
// ==========================================

export const getSubjects = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.department && params.department !== "All") {
    queryParams.append("department", params.department);
  }
  if (params.course && params.course !== "All") {
    queryParams.append("course", params.course);
  }
  if (params.semester && params.semester !== "All") {
    queryParams.append("semester", params.semester);
  }
  if (params.search) {
    queryParams.append("search", params.search);
  }

  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/subjects${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getSubjectById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/subjects/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const createSubject = async (subjectData) => {
  const response = await fetch(`${API_BASE_URL}/subjects`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(subjectData),
  });
  return handleResponse(response);
};

export const updateSubject = async (id, subjectData) => {
  const response = await fetch(`${API_BASE_URL}/subjects/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(subjectData),
  });
  return handleResponse(response);
};

export const deleteSubject = async (id) => {
  const response = await fetch(`${API_BASE_URL}/subjects/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// ==========================================
// ACADEMIC RECORDS APIS
// ==========================================

export const getAcademicRecords = async () => {
  const response = await fetch(`${API_BASE_URL}/academic`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getStudentAcademicRecords = async (studentId) => {
  const response = await fetch(`${API_BASE_URL}/academic/student/${studentId}`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const createAcademicRecord = async (academicData) => {
  const response = await fetch(`${API_BASE_URL}/academic`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(academicData),
  });
  return handleResponse(response);
};

export const updateAcademicRecord = async (id, academicData) => {
  const response = await fetch(`${API_BASE_URL}/academic/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(academicData),
  });
  return handleResponse(response);
};

export const deleteAcademicRecord = async (id) => {
  const response = await fetch(`${API_BASE_URL}/academic/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// ==========================================
// MARKS APIS
// ==========================================

export const getMarks = async () => {
  const response = await fetch(`${API_BASE_URL}/marks`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getStudentMarks = async (studentId, semester) => {
  const response = await fetch(
    `${API_BASE_URL}/marks/student/${studentId}/semester/${semester}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );
  return handleResponse(response);
};

export const createMarks = async (marksData) => {
  const response = await fetch(`${API_BASE_URL}/marks`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(marksData),
  });
  return handleResponse(response);
};

export const updateMarks = async (id, marksData) => {
  const response = await fetch(`${API_BASE_URL}/marks/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(marksData),
  });
  return handleResponse(response);
};

export const deleteMarks = async (id) => {
  const response = await fetch(`${API_BASE_URL}/marks/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// ==========================================
// ATTENDANCE APIS
// ==========================================

export const getAttendance = async () => {
  const response = await fetch(`${API_BASE_URL}/attendance`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getStudentAttendance = async (studentId, semester) => {
  const response = await fetch(
    `${API_BASE_URL}/attendance/student/${studentId}/semester/${semester}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );
  return handleResponse(response);
};

export const createAttendance = async (attendanceData) => {
  const response = await fetch(`${API_BASE_URL}/attendance`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(attendanceData),
  });
  return handleResponse(response);
};

export const updateAttendance = async (id, attendanceData) => {
  const response = await fetch(`${API_BASE_URL}/attendance/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(attendanceData),
  });
  return handleResponse(response);
};

export const deleteAttendance = async (id) => {
  const response = await fetch(`${API_BASE_URL}/attendance/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// ==========================================
// BACKLOGS APIS
// ==========================================

export const getBacklogs = async () => {
  const response = await fetch(`${API_BASE_URL}/backlogs`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const createBacklog = async (backlogData) => {
  const response = await fetch(`${API_BASE_URL}/backlogs`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(backlogData),
  });
  return handleResponse(response);
};

export const updateBacklog = async (id, backlogData) => {
  const response = await fetch(`${API_BASE_URL}/backlogs/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(backlogData),
  });
  return handleResponse(response);
};

export const clearBacklog = async (id, clearData) => {
  const response = await fetch(`${API_BASE_URL}/backlogs/${id}/clear`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(clearData),
  });
  return handleResponse(response);
};

export const deleteBacklog = async (id) => {
  const response = await fetch(`${API_BASE_URL}/backlogs/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(response);
};