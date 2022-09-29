export class Employee {
  constructor(firstName, lastName, hireDate, salary) {
    this.lastName = lastName;
    this.firstName = firstName;
    this.hireDate = hireDate;
    this.salary = _salary();
    this.salaryInt = salary;

    function _salary() {
      const price = new Intl.NumberFormat("en-US", { currency: "USD", style: "currency" }).format(salary);
      return price;
    }
  }
}
