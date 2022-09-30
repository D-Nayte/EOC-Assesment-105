import { Employee } from "./classes.js";

let tableHeadList;
let employees = [];

window.addEventListener("load", () => {
  generateUserDataSet();
});

//creates the tHead with alle information, based on the global "tableHeadList" and adds eventlistener for sorting
const createTableHead = () => {
  const table = document.querySelector("#employees");
  table.innerHTML = "";
  const fragment = document.createDocumentFragment();
  const tableHead = document.createElement("thead");
  const tableHeadRow = document.createElement("tr");
  const tableBody = document.createElement("tbody");

  tableHeadList.forEach((data) => {
    const tableItem = document.createElement("th");
    tableItem.textContent = data.charAt(0).toUpperCase() + data.slice(1);
    tableItem.dataset.col = data;
    tableHeadRow.append(tableItem);
  });

  tableHead.append(tableHeadRow);
  fragment.appendChild(tableHead);
  fragment.appendChild(tableBody);

  tableHead.addEventListener("click", (event) => sortArray(event));

  table.appendChild(fragment);
  return tableBody;
};

async function getUserNames(response) {
  //creates an array with the names an an array with the table head informations
  response = await response;
  let userNames = response.table.rows;

  const newUserDataSet = userNames.map((each) => {
    const firstName = each.c[0].v;
    const lastName = each.c[1].v;
    return { first: firstName, last: lastName };
  });
  let usersHead = newUserDataSet.shift();
  //Convert the responding object for table Head into Array
  usersHead = Object.keys(usersHead).map((key) => key);
  return { users: newUserDataSet, usersHead: usersHead };
}

async function getHireDates(response) {
  //create an array of dates out from the request; returns the array and the table Head information
  response = await response;
  let hireDates = response.table.rows;
  const hireHead = response.table.cols[0].label;

  hireDates = hireDates.map((each) => each.c[0].f);
  return { hireDates: hireDates, hireHead: hireHead };
}

async function getSalarys(response) {
  //create an array of salarys out from the request; returns the array and the table Head information
  response = await response;
  let salarys = response.table.rows;
  const salarysHead = response.table.cols[0].label;

  salarys = salarys.map((each) => each.c[0].f);
  return { salarys: salarys, salarysHead: salarysHead };
}

const generateNewEmployeeData = (user) => {
  //formatting to wanted Date format MMM DD YYYY
  const dateSettings = { month: "short", day: "numeric", year: "numeric" };
  let date = new Date(user.hireDate);
  date = date.toLocaleDateString("en-US", dateSettings).replace(",", "");

  //generate the "td" with all needed information for each user
  const fragment = document.createDocumentFragment();
  const newFirst = document.createElement("td");
  newFirst.textContent = user.first;
  const newLast = document.createElement("td");
  newLast.textContent = user.last;
  const newHireDate = document.createElement("td");
  newHireDate.textContent = date;
  const newSalary = document.createElement("td");
  newSalary.textContent = user.salary;

  fragment.append(newLast);
  fragment.append(newFirst);
  fragment.append(newHireDate);
  fragment.append(newSalary);
  return fragment;
};

const printUserDataOnTable = () => {
  //create the Table head from given parameter
  const tableBody = createTableHead();

  //create the row with all the datas out from the employees Array
  employees.forEach((user) => {
    const newRow = document.createElement("tr");

    newRow.append(generateNewEmployeeData(user));
    tableBody.append(newRow);
  });
};

async function generateUserDataSet() {
  // use the returning clean arrays to create employee object for each entry
  const { users, usersHead } = await getUserNames(fetchNames);
  const { hireDates, hireHead } = await getHireDates(fetchHireDates);
  const { salarys, salarysHead } = await getSalarys(fetchSalarys);
  tableHeadList = [...usersHead.reverse(), hireHead, salarysHead];

  //store the employee object in global Array
  for (let index = 0; index < users.length; index++) {
    const employee = new Employee(users[index].first, users[index].last, hireDates[index], salarys[index]);
    employees.push(employee);
  }
  sortArray("load");
}

function sortArray(event) {
  //initial sort; by last name
  if (event === "load") {
    employees.sort((firstUser, secondUser) => {
      if (firstUser["last"] === secondUser["last"]) {
        if (firstUser["first"] < secondUser["first"]) {
          return -1;
        } else {
          return 1;
        }
      }
      if (firstUser["last"] < secondUser["last"]) {
        return -1;
      }
      return 1;
    });
    createTableHead();
    printUserDataOnTable();

    let col = document.querySelector(`[data-col="last"]`);
    col.dataset.direct = "reverse";
    return;
  }
  //choosed column to sort based on "data-col" from event, setup wich sort direction to choose based on dataset too
  const sortType = event.target.dataset.col;
  let choosedColDirection = event.target.dataset.direct;
  let sortDirection = "reverse";

  //sorting by employees Name
  if (sortType === "first" || sortType === "last") {
    employees.sort((firstUser, secondUser) => {
      if (firstUser["last"] === secondUser["last"]) {
        if (firstUser["first"] < secondUser["first"]) {
          return -1;
        } else {
          return 1;
        }
      }
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
  if (sortType === "hire date") {
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
  createTableHead();
  printUserDataOnTable();
  let col = document.querySelector(`[data-col="${sortType}"]`);
  col.dataset.direct = sortDirection;
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
