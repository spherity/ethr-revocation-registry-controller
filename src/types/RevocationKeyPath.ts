import {RevocationListPath} from "./RevocationListPath";

export type RevocationKeyPath = RevocationListPath & {
  revocationKey: string;
}