class RevocationKeyStatusDto {
  public revocationKey: string;
  public revoked: boolean;

  constructor(revocationKey: string, revoked: boolean) {
    this.revocationKey = revocationKey;
    this.revoked = revoked;
  }
}