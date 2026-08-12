// ============================================================
// VVKF ATTENDANCE & PAYROLL SYSTEM
// FRONTEND JAVASCRIPT
// ============================================================

const API_URL =
  "https://script.google.com/macros/s/AKfycbwIHP0EAj4qjnGGz3obx_pHz6JOyFmx7K4gHVsZOhTnh0o4JBEErLc47aauNkfABYMZ/exec";


// ============================================================
// GLOBAL DATA
// ============================================================

let employees = [];


// ============================================================
// PAGE INFORMATION
// ============================================================

const pageInfo = {

  dashboard: {
    title: "Dashboard",
    subtitle: "Workforce overview"
  },

  employees: {
    title: "Employees",
    subtitle: "Manage employee information"
  },

  attendance: {
    title: "Attendance",
    subtitle: "Manage monthly attendance"
  },

  payroll: {
    title: "Payroll",
    subtitle: "Salary and payment management"
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
// INITIALIZE APPLICATION
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

  setupNavigation();

  setCurrentDate();

  loadEmployees();

});


// ============================================================
// NAVIGATION
// ============================================================

function setupNavigation() {

  document.querySelectorAll("[data-page]").forEach(function (button) {

    button.addEventListener("click", function () {

      const page = this.dataset.page;

      showPage(page);

    });

  });

}


// ============================================================
// SHOW PAGE
// ============================================================

function showPage(page) {

  document.querySelectorAll(".page").forEach(function (element) {

    element.classList.remove("active-page");

  });


  const selectedPage =
    document.getElementById(page + "Page");


  if (selectedPage) {

    selectedPage.classList.add("active-page");

  }


  document.querySelectorAll(".nav-item").forEach(function (item) {

    item.classList.remove("active");

    if (item.dataset.page === page) {

      item.classList.add("active");

    }

  });


  const info = pageInfo[page];


  if (info) {

    const title =
      document.getElementById("pageTitle");

    const subtitle =
      document.getElementById("pageSubtitle");

    if (title) {
      title.textContent = info.title;
    }

    if (subtitle) {
      subtitle.textContent = info.subtitle;
    }

  }


  // ----------------------------------------------------------
  // EMPLOYEE PAGE
  // ----------------------------------------------------------

  if (page === "employees") {

    renderEmployeesPage();

    // If data has not arrived yet,
    // load it again.
    if (employees.length === 0) {

      loadEmployees();

    }

  }

}


// ============================================================
// CURRENT DATE
// ============================================================

function setCurrentDate() {

  const dateElement =
    document.getElementById("currentDate");


  if (!dateElement) return;


  const today = new Date();


  dateElement.textContent =
    today.toLocaleDateString("en-IN", {

      weekday: "short",

      day: "2-digit",

      month: "short",

      year: "numeric"

    });

}


// ============================================================
// LOAD EMPLOYEES FROM GOOGLE SHEETS
// ============================================================

async function loadEmployees() {

  try {

    const response =
      await fetch(
        API_URL + "?action=getEmployees"
      );


    if (!response.ok) {

      throw new Error(
        "Unable to connect to Google Sheets API."
      );

    }


    const result =
      await response.json();


    if (!result.success) {

      throw new Error(
        result.error ||
        "Unable to load employees."
      );

    }


    employees =
      result.data || [];


    // Update dashboard
    updateDashboard();


    // IMPORTANT:
    // If Employees page is currently open,
    // refresh the table after data arrives.

    const employeesPage =
      document.getElementById("employeesPage");


    if (
      employeesPage &&
      employeesPage.classList.contains("active-page")
    ) {

      renderEmployeesPage();

    }


  }

  catch (error) {

    console.error(
      "Employee loading error:",
      error
    );


    // Keep application working even if
    // API temporarily fails.

    updateDashboard();

  }

}


// ============================================================
// UPDATE DASHBOARD
// ============================================================

function updateDashboard() {

  const total =
    employees.length;


  const active =
    employees.filter(function (employee) {

      return String(
        employee.status || ""
      ).toUpperCase() === "ACTIVE";

    }).length;


  const totalElement =
    document.getElementById(
      "totalEmployees"
    );


  const activeElement =
    document.getElementById(
      "activeEmployees"
    );


  if (totalElement) {

    totalElement.textContent =
      total;

  }


  if (activeElement) {

    activeElement.textContent =
      active;

  }


  renderDepartmentSummary();

}


// ============================================================
// DEPARTMENT SUMMARY
// ============================================================

function renderDepartmentSummary() {

  const container =
    document.getElementById(
      "departmentSummary"
    );


  if (!container) return;


  if (employees.length === 0) {

    container.innerHTML =
      '<div class="loading">No employees found.</div>';

    return;

  }


  const departments = {};


  employees.forEach(function (employee) {

    const department =
      employee.department || "OTHER";


    if (!departments[department]) {

      departments[department] = 0;

    }


    departments[department]++;

  });


  container.innerHTML = "";


  Object.keys(departments)
    .sort()
    .forEach(function (department) {

      const row =
        document.createElement("div");


      row.className =
        "department-row";


      row.innerHTML = `

        <span>
          ${escapeHtml(department)}
        </span>

        <strong>
          ${departments[department]}
        </strong>

      `;


      container.appendChild(row);

    });

}


// ============================================================
// EMPLOYEE PAGE
// ============================================================

function renderEmployeesPage() {

  const page =
    document.getElementById(
      "employeesPage"
    );


  if (!page) return;


  page.innerHTML = `

    <div class="module-header">

      <div>

        <h2>
          Employee Management
        </h2>

        <p>
          Manage employee master information.
        </p>

      </div>


      <button
        class="primary-button"
        id="addEmployeeButton">

        + Add Employee

      </button>

    </div>


    <div class="employee-toolbar">

      <input
        type="text"
        id="employeeSearch"
        class="search-input"
        placeholder="Search employee...">


      <select
        id="departmentFilter"
        class="filter-select">

        <option value="">
          All Departments
        </option>

        ${getDepartmentOptions("")}

      </select>


      <select
        id="statusFilter"
        class="filter-select">

        <option value="">
          All Status
        </option>

        <option value="ACTIVE">
          Active
        </option>

        <option value="INACTIVE">
          Inactive
        </option>

      </select>

    </div>


    <div class="panel employee-panel">

      <div class="table-wrapper">

        <table class="employee-table">

          <thead>

            <tr>

              <th>Employee ID</th>

              <th>Name</th>

              <th>Department</th>

              <th>Salary</th>

              <th>Sunday Pay</th>

              <th>Working Hours</th>

              <th>Status</th>

              <th>Action</th>

            </tr>

          </thead>


          <tbody id="employeeTableBody">

          </tbody>

        </table>

      </div>

    </div>

  `;


  const addButton =
    document.getElementById(
      "addEmployeeButton"
    );


  if (addButton) {

    addButton.addEventListener(
      "click",
      openAddEmployeeModal
    );

  }


  const search =
    document.getElementById(
      "employeeSearch"
    );


  if (search) {

    search.addEventListener(
      "input",
      filterEmployees
    );

  }


  const department =
    document.getElementById(
      "departmentFilter"
    );


  if (department) {

    department.addEventListener(
      "change",
      filterEmployees
    );

  }


  const status =
    document.getElementById(
      "statusFilter"
    );


  if (status) {

    status.addEventListener(
      "change",
      filterEmployees
    );

  }


  renderEmployeeTable(employees);

}


// ============================================================
// EMPLOYEE TABLE
// ============================================================

function renderEmployeeTable(data) {

  const tbody =
    document.getElementById(
      "employeeTableBody"
    );


  if (!tbody) return;


  tbody.innerHTML = "";


  if (!data || data.length === 0) {

    tbody.innerHTML = `

      <tr>

        <td
          colspan="8"
          class="empty-table">

          No employees found.

        </td>

      </tr>

    `;

    return;

  }


  data.forEach(function (employee) {

    const row =
      document.createElement("tr");


    const status =
      String(
        employee.status || "ACTIVE"
      ).toUpperCase();


    row.innerHTML = `

      <td>

        <strong>
          ${escapeHtml(
            employee.employeeId || ""
          )}
        </strong>

      </td>


      <td>
        ${escapeHtml(
          employee.name || ""
        )}
      </td>


      <td>
        ${escapeHtml(
          employee.department || ""
        )}
      </td>


      <td>
        ${formatCurrency(
          employee.salary
        )}
      </td>


      <td>

        ${
          employee.sundayPay === "" ||
          employee.sundayPay == null

          ? "—"

          : formatCurrency(
              employee.sundayPay
            )

        }

      </td>


      <td>

        ${
          employee.workingHours === "" ||
          employee.workingHours == null

          ? "—"

          : employee.workingHours + " hrs"

        }

      </td>


      <td>

        <span
          class="status-badge ${
            status === "ACTIVE"
              ? "status-active"
              : "status-inactive"
          }">

          ${status}

        </span>

      </td>


      <td>

        <button
          class="edit-button"
          data-employee-id="${escapeHtml(
            employee.employeeId || ""
          )}">

          Edit

        </button>

      </td>

    `;


    tbody.appendChild(row);

  });


  document
    .querySelectorAll(".edit-button")
    .forEach(function (button) {

      button.addEventListener(
        "click",
        function () {

          const id =
            this.dataset.employeeId;


          const employee =
            employees.find(
              function (item) {

                return String(
                  item.employeeId
                ) === String(id);

              }
            );


          if (employee) {

            openEditEmployeeModal(
              employee
            );

          }

        }
      );

    });

}


// ============================================================
// FILTER EMPLOYEES
// ============================================================

function filterEmployees() {

  const searchElement =
    document.getElementById(
      "employeeSearch"
    );


  const departmentElement =
    document.getElementById(
      "departmentFilter"
    );


  const statusElement =
    document.getElementById(
      "statusFilter"
    );


  const search =
    searchElement
      ? searchElement.value
          .toLowerCase()
          .trim()
      : "";


  const department =
    departmentElement
      ? departmentElement.value
      : "";


  const status =
    statusElement
      ? statusElement.value
      : "";


  const filtered =
    employees.filter(
      function (employee) {

        const employeeId =
          String(
            employee.employeeId || ""
          ).toLowerCase();


        const name =
          String(
            employee.name || ""
          ).toLowerCase();


        const employeeDepartment =
          String(
            employee.department || ""
          ).toLowerCase();


        const matchesSearch =

          !search ||

          employeeId.includes(search) ||

          name.includes(search) ||

          employeeDepartment.includes(search);


        const matchesDepartment =

          !department ||

          employee.department === department;


        const matchesStatus =

          !status ||

          String(
            employee.status || ""
          ).toUpperCase() === status;


        return (

          matchesSearch &&

          matchesDepartment &&

          matchesStatus

        );

      }
    );


  renderEmployeeTable(filtered);

}


// ============================================================
// ADD EMPLOYEE
// ============================================================

function openAddEmployeeModal() {

  showEmployeeModal();

}


// ============================================================
// EDIT EMPLOYEE
// ============================================================

function openEditEmployeeModal(employee) {

  showEmployeeModal(employee);

}


// ============================================================
// EMPLOYEE MODAL
// ============================================================

function showEmployeeModal(
  employee = null
) {

  const isEdit =
    employee !== null;


  const oldModal =
    document.getElementById(
      "employeeModal"
    );


  if (oldModal) {

    oldModal.remove();

  }


  const modal =
    document.createElement("div");


  modal.className =
    "modal-overlay";


  modal.id =
    "employeeModal";


  modal.innerHTML = `

    <div class="modal-card">


      <div class="modal-header">

        <div>

          <h2>

            ${
              isEdit
                ? "Edit Employee"
                : "Add Employee"
            }

          </h2>

          <p>

            ${
              isEdit
                ? "Update employee information."
                : "Create a new employee record."
            }

          </p>

        </div>


        <button
          class="modal-close"
          id="closeEmployeeModal">

          ×

        </button>

      </div>


      <form id="employeeForm">


        ${
          isEdit

          ? `

            <div class="form-group">

              <label>
                Employee ID
              </label>

              <input
                type="text"
                value="${escapeHtml(
                  employee.employeeId
                )}"
                disabled>

            </div>

          `

          : `

            <div class="auto-id-note">

              Employee ID will be generated
              automatically based on department.

            </div>

          `

        }


        <div class="form-group">

          <label>

            Name
            <span>*</span>

          </label>


          <input
            type="text"
            id="employeeName"
            required
            value="${
              isEdit
                ? escapeHtml(employee.name)
                : ""
            }"
            placeholder="Enter employee name">

        </div>


        <div class="form-group">

          <label>

            Department
            <span>*</span>

          </label>


          <select
            id="employeeDepartment"
            required>

            <option value="">
              Select Department
            </option>

            ${getDepartmentOptions(
              isEdit
                ? employee.department
                : ""
            )}

          </select>

        </div>


        <div class="form-group">

          <label>

            Salary
            <span>*</span>

          </label>


          <input
            type="number"
            id="employeeSalary"
            min="1"
            required
            value="${
              isEdit
                ? employee.salary
                : ""
            }"
            placeholder="Enter monthly salary">

        </div>


        <div class="form-row">


          <div class="form-group">

            <label>
              Sunday Pay
            </label>


            <input
              type="number"
              id="employeeSundayPay"
              min="0"
              value="${
                isEdit
                  ? employee.sundayPay || ""
                  : ""
              }"
              placeholder="Optional">

          </div>


          <div class="form-group">

            <label>
              Working Hours
            </label>


            <input
              type="number"
              id="employeeWorkingHours"
              min="1"
              step="0.5"
              value="${
                isEdit
                  ? employee.workingHours || ""
                  : ""
              }"
              placeholder="Optional">

          </div>


        </div>


        <div class="form-group">

          <label>

            Status
            <span>*</span>

          </label>


          <select
            id="employeeStatus"
            required>

            <option
              value="ACTIVE"
              ${
                !isEdit ||
                employee.status === "ACTIVE"
                  ? "selected"
                  : ""
              }>

              ACTIVE

            </option>


            <option
              value="INACTIVE"
              ${
                isEdit &&
                employee.status === "INACTIVE"
                  ? "selected"
                  : ""
              }>

              INACTIVE

            </option>

          </select>

        </div>


        <div
          class="form-message"
          id="employeeFormMessage">
        </div>


        <div class="modal-actions">


          <button
            type="button"
            class="secondary-button"
            id="cancelEmployee">

            Cancel

          </button>


          <button
            type="submit"
            class="primary-button"
            id="saveEmployeeButton">

            ${
              isEdit
                ? "Update Employee"
                : "Save Employee"
            }

          </button>


        </div>


      </form>

    </div>

  `;


  document.body.appendChild(modal);


  document
    .getElementById(
      "closeEmployeeModal"
    )
    .addEventListener(
      "click",
      closeEmployeeModal
    );


  document
    .getElementById(
      "cancelEmployee"
    )
    .addEventListener(
      "click",
      closeEmployeeModal
    );


  document
    .getElementById(
      "employeeForm"
    )
    .addEventListener(
      "submit",
      function (event) {

        event.preventDefault();


        if (isEdit) {

          updateEmployee(
            employee.employeeId
          );

        }

        else {

          saveEmployee();

        }

      }
    );

}


// ============================================================
// DEPARTMENT OPTIONS
// ============================================================

function getDepartmentOptions(
  selected
) {

  const departments = [

    "STAFF",

    "SINKER",

    "INTER",

    "AUTO",

    "COLLOR",

    "MENDING",

    "DRIVER",

    "GATE",

    "BOILER",

    "HELPER",

    "SR. HELPER"

  ];


  return departments
    .map(function (department) {

      return `

        <option
          value="${department}"
          ${
            department === selected
              ? "selected"
              : ""
          }>

          ${department}

        </option>

      `;

    })
    .join("");

}


// ============================================================
// SAVE EMPLOYEE
// ============================================================

async function saveEmployee() {

  const button =
    document.getElementById(
      "saveEmployeeButton"
    );


  const message =
    document.getElementById(
      "employeeFormMessage"
    );


  const employee = {

    name:
      document
        .getElementById(
          "employeeName"
        )
        .value
        .trim(),

    department:
      document
        .getElementById(
          "employeeDepartment"
        )
        .value,

    salary:
      document
        .getElementById(
          "employeeSalary"
        )
        .value,

    sundayPay:
      document
        .getElementById(
          "employeeSundayPay"
        )
        .value,

    workingHours:
      document
        .getElementById(
          "employeeWorkingHours"
        )
        .value,

    status:
      document
        .getElementById(
          "employeeStatus"
        )
        .value

  };


  if (
    !employee.name ||
    !employee.department ||
    !employee.salary
  ) {

    showFormMessage(
      "Please fill all mandatory fields.",
      "error"
    );

    return;

  }


  try {

    button.disabled = true;

    button.textContent =
      "Saving...";


    const response =
      await fetch(
        API_URL,
        {

          method: "POST",

          headers: {
            "Content-Type":
              "text/plain;charset=utf-8"
          },

          body: JSON.stringify({

            action:
              "addEmployee",

            data:
              employee

          })

        }
      );


    const result =
      await response.json();


    if (!result.success) {

      throw new Error(
        result.error ||
        "Unable to save employee."
      );

    }


    showFormMessage(
      "Employee saved successfully.",
      "success"
    );


    await loadEmployees();


    setTimeout(
      closeEmployeeModal,
      700
    );


  }

  catch (error) {

    console.error(error);


    showFormMessage(
      error.message ||
      "Unable to save employee.",
      "error"
    );


    button.disabled = false;

    button.textContent =
      "Save Employee";

  }

}


// ============================================================
// UPDATE EMPLOYEE
// ============================================================

async function updateEmployee(
  employeeId
) {

  const button =
    document.getElementById(
      "saveEmployeeButton"
    );


  const message =
    document.getElementById(
      "employeeFormMessage"
    );


  const employee = {

    employeeId:
      employeeId,

    name:
      document
        .getElementById(
          "employeeName"
        )
        .value
        .trim(),

    department:
      document
        .getElementById(
          "employeeDepartment"
        )
        .value,

    salary:
      document
        .getElementById(
          "employeeSalary"
        )
        .value,

    sundayPay:
      document
        .getElementById(
          "employeeSundayPay"
        )
        .value,

    workingHours:
      document
        .getElementById(
          "employeeWorkingHours"
        )
        .value,

    status:
      document
        .getElementById(
          "employeeStatus"
        )
        .value

  };


  if (
    !employee.name ||
    !employee.department ||
    !employee.salary
  ) {

    showFormMessage(
      "Please fill all mandatory fields.",
      "error"
    );

    return;

  }


  try {

    button.disabled = true;

    button.textContent =
      "Updating...";


    const response =
      await fetch(
        API_URL,
        {

          method: "POST",

          headers: {
            "Content-Type":
              "text/plain;charset=utf-8"
          },

          body: JSON.stringify({

            action:
              "updateEmployee",

            data:
              employee

          })

        }
      );


    const result =
      await response.json();


    if (!result.success) {

      throw new Error(
        result.error ||
        "Unable to update employee."
      );

    }


    showFormMessage(
      "Employee updated successfully.",
      "success"
    );


    await loadEmployees();


    setTimeout(
      closeEmployeeModal,
      700
    );


  }

  catch (error) {

    console.error(error);


    showFormMessage(
      error.message ||
      "Unable to update employee.",
      "error"
    );


    button.disabled = false;

    button.textContent =
      "Update Employee";

  }

}


// ============================================================
// CLOSE MODAL
// ============================================================

function closeEmployeeModal() {

  const modal =
    document.getElementById(
      "employeeModal"
    );


  if (modal) {

    modal.remove();

  }

}


// ============================================================
// FORM MESSAGE
// ============================================================

function showFormMessage(
  text,
  type
) {

  const message =
    document.getElementById(
      "employeeFormMessage"
    );


  if (!message) return;


  message.textContent =
    text;


  message.className =
    "form-message " +
    (type || "");

}


// ============================================================
// FORMAT CURRENCY
// ============================================================

function formatCurrency(
  value
) {

  if (
    value === "" ||
    value === null ||
    value === undefined ||
    isNaN(Number(value))
  ) {

    return "—";

  }


  return Number(value).toLocaleString(
    "en-IN",
    {

      style: "currency",

      currency: "INR",

      maximumFractionDigits: 0

    }
  );

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(value) {

  return String(
    value === null ||
    value === undefined
      ? ""
      : value
  )

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
