export class Employee {
  constructor(firstName, lastName, hireDate, salary) {
    this.last = lastName;
    this.first = firstName;
    this.hiredate = _hireDateFormate(hireDate);
    this.timestamp = _timestamp(hireDate);
    this.salary = _salary();
    this.salaryInt = salary;
    this.lol = 2;

    function _salary() {
      const price = new Intl.NumberFormat("en-US", { currency: "USD", style: "currency" }).format(salary);
      return price;
    }

    function _hireDateFormate(hireDate) {
      //formatting to wanted Date format MMM DD YYYY
      const dateSettings = { month: "short", day: "2-digit", year: "numeric" };
      let date = new Date(hireDate);
      date = date.toLocaleDateString("en-US", dateSettings).replace(",", "");
      return date;
    }

    function _timestamp(hireDate) {
      //timestamp for easy sorting
      const date = new Date(hireDate);
      return date.getTime();
    }
  }
}
export class TableHead {
  constructor(title, newFunction) {
    this.title = _titleFormatted(title);
    this.field = title.replace(" ", "");
    this.sortable = true;
    this.sorter = newFunction;

    function _titleFormatted(title) {
      if (title === "hire date") {
        title = title
          .split(" ")
          .map((string) => string.charAt(0).toUpperCase() + string.slice(1))
          .join()
          .replace(",", " ");
        return title;
      }

      return title.charAt(0).toUpperCase() + title.slice(1);
    }
  }
}
