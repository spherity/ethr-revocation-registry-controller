class RevocationPathDto {
  public namespace: string;
  public list: string;
  public revocationKey: string;

  constructor(namespace: string, list: string, revocationKey: string) {
    this.namespace = namespace;
    this.list = list;
    this.revocationKey = revocationKey;
  }
}