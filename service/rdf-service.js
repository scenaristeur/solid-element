export async function getProfile(this) {

console.log(this.session)
  if (!this.session) {
    await this.getSession();
  }

  try {
    await this.fetcher.load(this.session.webId);
console.log("ok")
    return {
      detail: "ok"
      /*fn : this.getValueFromVcard('fn'),
      company : this.getValueFromVcard('organization-name'),
      phone: this.getPhone(),
      role: this.getValueFromVcard('role'),
      image: this.getValueFromVcard('hasPhoto'),
      address: this.getAddress(),
      email: this.getEmail(),*/
    };
  } catch (error) {
    console.log(`Error fetching data: ${error}`);
  }
};
