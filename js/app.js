const API_URL =
  "https://script.google.com/macros/s/AKfycbwIHP0EAj4qjnGGz3obx_pHz6JOyFmx7K4gHVsZOhTnh0o4JBEErLc47aauNkfABYMZ/exec";


// ============================================================
// PAGE CONFIGURATION
// ============================================================

const pages = {

  dashboard: {
    title: "Dashboard",
    subtitle: "Workforce overview"
  },

  employees: {
    title: "Employee Management",
    subtitle: "Manage employee information"
  },

  attendance: {
    title: "Attendance",
    subtitle: "Manage daily attendance"
  },

  payroll: {
    title: "Payroll",
    subtitle: "Manage monthly payroll"
  },

  reports: {
    title: "Reports",
    subtitle: "Attendance and payroll reports"
  },

  settings: {
    title: "Settings",
    subtitle: "System configuration"
  }

};


// ============================================================
// NAVIGATION
// ============================================================

document
  .querySelectorAll("[data-page]")
  .forEach(button => {

    button.addEventListener("click", () => {

      const page =
        button.dataset.page;

      openPage(page);

    });

  });


function openPage(page) {

  // Remove active page

  document
    .querySelectorAll(".page")
    .forEach(element => {

      element.classList.remove(
        "active-page"
      );

    });


  // Show selected page

  const selectedPage =
    document.getElementById(
      page + "Page"
    );


  if (selectedPage) {

    selectedPage.classList.add(
      "active-page"
    );

  }


  // Sidebar active state

  document
    .querySelectorAll(".nav-item")
    .forEach(item => {

      item.classList.remove(
        "active"
      );

      if (
        item.dataset.page === page
      ) {

        item.classList.add(
          "active"
        );

      }

    });


  // Update title

  if (pages[page]) {

    document.getElementById(
      "pageTitle"
    ).textContent =
      pages[page].title;


    document.getElementById(
      "pageSubtitle"
    ).textContent =
      pages[page].subtitle;

  }

}


// ============================================================
// CURRENT DATE
// ============================================================

function showCurrentDate() {

  const today =
    new Date();


  const formatted =
    today.toLocaleDateString(
      "en-IN",
      {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );


  document.getElementById(
    "currentDate"
  ).textContent =
    formatted;

}


// ============================================================
// LOAD EMPLOYEES
// ============================================================

async function loadEmployees() {

  try {

    const response =
      await fetch(
        API_URL +
        "?action=getEmployees"
      );


    const result =
      await response.json();


    if (!result.success) {

      throw new Error(
        result.error ||
        "Unable to load employees."
      );

    }


    const employees =
      result.data || [];


    updateDashboard(
      employees
    );


  } catch (error) {

    console.error(
      "API Error:",
      error
    );

  }

}


// ============================================================
// DASHBOARD
// ============================================================

function updateDashboard(
  employees
) {

  const total =
    employees.length;


  const active =
    employees.filter(
      employee =>
        employee.status === "ACTIVE"
    ).length;


  document.getElementById(
    "totalEmployees"
  ).textContent =
    total;


  document.getElementById(
    "activeEmployees"
  ).textContent =
    active;


  // Department summary

  const departments = {};


  employees.forEach(
    employee => {

      const department =
        employee.department ||
        "OTHER";


      departments[department] =
        (departments[department] || 0) + 1;

    }
  );


  const container =
    document.getElementById(
      "departmentSummary"
    );


  const entries =
    Object.entries(
      departments
    );


  if (!entries.length) {

    container.innerHTML =
      `<div class="loading">
        No employee data available.
      </div>`;

    return;

  }


  container.innerHTML =
    entries
      .sort(
        (a, b) =>
          b[1] - a[1]
      )
      .map(
        ([department, count]) => `

          <div class="department-row">

            <span class="department-name">
              ${escapeHtml(department)}
            </span>

            <span class="department-count">
              ${count}
            </span>

          </div>

        `
      )
      .join("");

}


// ============================================================
// HTML SECURITY
// ============================================================

function escapeHtml(value) {

  return String(value ?? "")
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


// ============================================================
// START
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    showCurrentDate();

    loadEmployees();

  }
);
