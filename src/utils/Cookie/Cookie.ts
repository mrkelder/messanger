class Cookie {
  public static get(name: string): string | null {
    const cookies = document.cookie;
    const regExp = new RegExp(`${name}=[a-zA-Z0-9-_.]+`);
    const result = cookies.match(regExp);

    if (result) return result[0].split("=")[1];
    else return null;
  }

  public static set(name: string, value: string): void {
    Cookie.remove(name);
    document.cookie = `${name}=${value}; path=*; max-age=60*60*24*30`;
  }

  public static remove(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=*;`;
  }
}

export default Cookie;
