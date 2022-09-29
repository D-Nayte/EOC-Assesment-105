import { Employee } from "./classes.js";

// const dataURLBase = "https://docs.google.com/spreadsheets/d/";
// const dataURLEnd = "/gviz/tq?tqx=out:json&tq&gid=";
// const id = "1C1-em4w0yHmd2N7__9cCSFzxBEf_8r74hQJBsR6qWnE";
// const gids = ["0", "1574569648", "1605451198"];
let employees = [];

generateUserDataSet();
window.addEventListener("load", () => {
  createTable();
});

async function getDataFromSheet(gids) {
  const urlToCall = `${dataURLBase}${id}${dataURLEnd}${gids}`;
  try {
    const response = await fetch(urlToCall);
    const dataInText = await response.text();
    const dataFormatted = dataInText.substring(47).slice(0, -2);
    const json = JSON.parse(dataFormatted);
    return json;
  } catch (error) {
    console.error("API ERROR:", error);
  }
}

const createTable = () => {
  const table = document.querySelector("#employees");
  table.innerHTML = "";
  const fragment = document.createDocumentFragment();
  const tableHead = document.createElement("thead");
  const tableHeadRow = document.createElement("tr");

  const tableHeadLastName = document.createElement("th");
  tableHeadLastName.textContent = "Last";
  tableHeadLastName.dataset.col = "lastName";

  const tableHeadFirstName = document.createElement("th");
  tableHeadFirstName.textContent = "First";
  tableHeadFirstName.dataset.col = "firstName";

  const tableHeadHireDate = document.createElement("th");
  tableHeadHireDate.textContent = "Hire Date";
  tableHeadHireDate.dataset.col = "hireDate";

  const tableHeadSalary = document.createElement("th");
  tableHeadSalary.textContent = "Salary";
  tableHeadSalary.dataset.col = "salary";

  const tableBody = document.createElement("tbody");

  tableHeadRow.append(tableHeadFirstName);
  tableHeadRow.append(tableHeadLastName);
  tableHeadRow.append(tableHeadHireDate);
  tableHeadRow.append(tableHeadSalary);
  tableHead.append(tableHeadRow);
  fragment.appendChild(tableHead);
  fragment.appendChild(tableBody);

  tableHead.addEventListener("click", (event) => sortArray(event));

  table.appendChild(fragment);
};

async function getUserNames(response) {
  response = await response;
  let userNames = response.table.rows;
  userNames.shift();

  const newUserDataSet = userNames.map((each) => {
    const firstName = each.c[0].v;
    const lastName = each.c[1].v;
    if (firstName !== "first" || lastName !== "last") {
      return { first: firstName, last: lastName };
    }
  });
  return newUserDataSet;
}

async function getHireDates(response) {
  response = await response;
  let hireDates = response.table.rows;

  hireDates = hireDates.map((each) => each.c[0].f);
  return hireDates;
}

async function getSalarys(response) {
  response = await response;
  let salarys = response.table.rows;

  salarys = salarys.map((each) => each.c[0].f);
  return salarys;
}

const generateNewEmployeeData = (user) => {
  const dateSettings = { month: "long", day: "numeric", year: "numeric" };
  let date = new Date(user.hireDate);
  date = date.toLocaleDateString("en-US", dateSettings).replace(",", "");

  const fragment = document.createDocumentFragment();
  const newFirst = document.createElement("td");
  newFirst.textContent = user.firstName;
  const newLast = document.createElement("td");
  newLast.textContent = user.lastName;
  const newHireDate = document.createElement("td");
  newHireDate.textContent = date;
  const newSalary = document.createElement("td");
  newSalary.textContent = user.salary;

  fragment.append(newFirst);
  fragment.append(newLast);
  fragment.append(newHireDate);
  fragment.append(newSalary);
  return fragment;
};

const printUserDataOnTable = () => {
  employees.forEach((user) => {
    const tableBody = document.querySelector("tbody");
    const newRow = document.createElement("tr");

    newRow.append(generateNewEmployeeData(user));
    tableBody.append(newRow);
  });
};

async function generateUserDataSet() {
  const users = await getUserNames(fetchNames);
  const hireDates = await getHireDates(fetchHireDates);
  const salarys = await getSalarys(fetchSalarys);

  for (let index = 0; index < users.length; index++) {
    const employee = new Employee(users[index].first, users[index].last, hireDates[index], salarys[index]);
    employees.push(employee);
  }
  printUserDataOnTable();
}

function sortArray(event) {
  //choose the column to sort based on "data-col" from event, setup wich sort direction to choose based on dataset too
  const sortType = event.target.dataset.col;
  let choosedColDirection = event.target.dataset.direct;
  let sortDirection = "reverse";

  //sorting by employees Name
  if (sortType === "firstName" || sortType === "lastName") {
    employees.sort((firstUser, secondUser) => {
      if (firstUser[sortType] < secondUser[sortType]) {
        return -1;
      }
      return 1;
    });
  }

  //sorting by Salary
  if (sortType === "salary") {
    employees.sort((firstUser, secondUser) => {
      let firstInt = parseInt(firstUser.salaryInt);
      let secondtInt = parseInt(secondUser.salaryInt);
      return firstInt - secondtInt;
    });
  }

  //sort by Date
  if (sortType === "hireDate") {
    employees.sort((firstUser, secondUser) => {
      const { firstYear, secondYear, firstMonth, secondMonth, firstDay, secondDay } = getDateAsNumbersIndividually(firstUser, secondUser);

      //Check the dates against each other so sort it by day, month and Year
      if (firstYear === secondYear) {
        if (firstMonth === secondMonth) {
          return firstDay - secondDay;
        }
        return firstMonth - secondMonth;
      }
      return firstYear - secondYear;
    });
  }

  //revert the sortet array if its already sorted and the relatetd col is clicked again
  if (choosedColDirection === "reverse") {
    employees.reverse();
    sortDirection = "default";
  }

  //repaint the table; mark the columens with sort direction
  createTable();
  let col = document.querySelector(`[data-col="${sortType}"]`);
  col.dataset.direct = sortDirection;
  printUserDataOnTable();
}

function getDateAsNumbersIndividually(firstUser, secondUser) {
  //get the Year's out from the Date as a number
  let firstYear = new Date(firstUser.hireDate);
  firstYear = parseInt(firstYear.toLocaleDateString("en-US", { year: "numeric" }));
  let secondYear = new Date(secondUser.hireDate);
  secondYear = parseInt(secondYear.toLocaleDateString("en-US", { year: "numeric" }));

  //get the Month's' out from the Date as a number
  let firstMonth = new Date(firstUser.hireDate);
  firstMonth = parseInt(firstMonth.toLocaleDateString("en-US", { month: "2-digit" }));
  let secondMonth = new Date(secondUser.hireDate);
  secondMonth = parseInt(secondMonth.toLocaleDateString("en-US", { month: "2-digit" }));

  //get the Day's out from the Date as a number
  let firstDay = new Date(firstUser.hireDate);
  firstDay = parseInt(firstDay.toLocaleDateString("en-US", { day: "2-digit" }));
  let secondDay = new Date(secondUser.hireDate);
  secondDay = parseInt(secondDay.toLocaleDateString("en-US", { day: "2-digit" }));

  return { firstYear, secondYear, firstMonth, secondMonth, firstDay, secondDay };
}
