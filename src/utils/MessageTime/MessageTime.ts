class MessageTime {
  private static currentDate = new Date(Date.now());
  private messageDate: Date;

  constructor(messageISODate: string) {
    this.messageDate = new Date(messageISODate);
  }

  public returnMessageISODate(): string {
    if (this.shouldReturnMessageTime()) return this.returnMessageTime();
    else if (this.shouldReturnMessageDate()) return this.returnMessageDate();
    else if (this.shouldReturnMessageYear()) return this.returnMessageYear();
    else return "Error";
  }

  private returnMessageTime(): string {
    return `${this.messageDate.getHours()}:${this.messageDate.getMinutes()}`;
  }

  private returnMessageDate(): string {
    return `${this.messageDate.getDate()} ${this.returnMonthName(
      this.messageDate.getMonth()
    )}`;
  }

  private returnMessageYear(): string {
    return String(this.messageDate.getFullYear());
  }

  private shouldReturnMessageTime(): boolean {
    return this.areYearsEqual() && this.areMonthsEqual() && this.areDaysEqual();
  }

  private shouldReturnMessageDate(): boolean {
    return (
      !this.shouldReturnMessageTime() && !this.isMessageMoreThanOneYearsOld()
    );
  }

  private shouldReturnMessageYear(): boolean {
    return this.isMessageMoreThanOneYearsOld();
  }

  private areYearsEqual(): boolean {
    return (
      MessageTime.currentDate.getFullYear() === this.messageDate.getFullYear()
    );
  }

  private areMonthsEqual(): boolean {
    return MessageTime.currentDate.getMonth() === this.messageDate.getMonth();
  }

  private areDaysEqual(): boolean {
    return MessageTime.currentDate.getDate() === this.messageDate.getDate();
  }

  private isMessageMoreThanOneYearsOld(): boolean {
    return (
      MessageTime.currentDate.getFullYear() > this.messageDate.getFullYear()
    );
  }

  private returnMonthName(monthIndex: number): string {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];

    return monthNames[monthIndex];
  }
}

export default MessageTime;
