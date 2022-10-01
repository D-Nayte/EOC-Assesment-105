import { Employee, TableHead } from "./classes.js";

let test = {
  version: "0.6",
  reqId: "0",
  status: "ok",
  sig: "2041401357",
  table: {
    cols: [
      { id: "A", label: "", type: "string" },
      { id: "B", label: "", type: "string" },
    ],
    rows: [
      { c: [{ v: "first" }, { v: "last" }] },
      { c: [{ v: "aa" }, { v: "z" }] },
      { c: [{ v: "cc" }, { v: "aaac" }] },
      { c: [{ v: "bb" }, { v: "z" }] },
      { c: [{ v: "cc" }, { v: "aaab" }] },
      { c: [{ v: "dd" }, { v: "z" }] },
    ],
    parsedNumHeaders: 0,
  },
};

window.addEventListener("load", () => {
  generateTableDatas();
});

async function getUserNames(response) {
  //creates an array with the names an an array with the table head informations
  response = await response;
  //response = test;
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

function createTableHead(usersHead, hireHead, salarysHead) {
  usersHead = usersHead.map((title) => new TableHead(title, sortNames));
  hireHead = new TableHead(hireHead, sortByDate);
  salarysHead = new TableHead(salarysHead, sortSalaryByNumbers);

  return [...usersHead.reverse(), hireHead, salarysHead];
}

function createEmployees(users, hireDates, salarys) {
  let employees = [];

  for (let index = 0; index < users.length; index++) {
    const employee = new Employee(users[index].first, users[index].last, hireDates[index], salarys[index]);
    employees.push(employee);
  }
  return employees;
}

async function generateTableDatas() {
  // request and format the response into an arrays for table header and table body
  let { users, usersHead } = await getUserNames(fetchNames);
  let { hireDates, hireHead } = await getHireDates(fetchHireDates);
  let { salarys, salarysHead } = await getSalarys(fetchSalarys);

  let tableHeadList = createTableHead(usersHead, hireHead, salarysHead);
  let employeeList = createEmployees(users, hireDates, salarys);

  printTable(tableHeadList, employeeList);
}

function printTable(tableHeadList, employeesList) {
  $("#employees").bootstrapTable({
    columns: tableHeadList,
    data: employeesList,
  });
}

function sortSalaryByNumbers(a, b, firstUserDatas, secondsUserDatas) {
  return firstUserDatas.salaryInt - secondsUserDatas.salaryInt;
}

function sortNames(firstUserName, secondUserName, firstEmployeeData = false, secondEmployeeData = false) {
  const sortByFirstName = firstUserName === firstEmployeeData.first;
  const sortByLastName = firstUserName === firstEmployeeData.last;

  if (sortByFirstName) {
    console.log("SORT FIRSTNAME");
    if (firstUserName !== secondUserName) {
      return firstUserName < secondUserName ? -1 : 1;
    }
    return firstEmployeeData.last < secondEmployeeData.last ? -1 : 1;
  }
  if (sortByLastName || firstLoad === true) {
    console.log("SORT LASTNAME");
    // console.log(firstUserName, secondUserName, firstUserName === secondUserName);
    if (firstUserName !== secondUserName) {
      return firstUserName < secondUserName ? -1 : 1;
    }
    return firstEmployeeData.first < secondEmployeeData.first ? -1 : 1;
  }
}

function sortByDate(firstDate, secondDate, firstDateData, secondDateData) {
  //sort by Date
  const firstTimesatamp = firstDateData.timestamp;
  const secondTimesatamp = secondDateData.timestamp;

  return firstTimesatamp - secondTimesatamp;
}
