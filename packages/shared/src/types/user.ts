export enum AccountProviders {
  Credentials = "Credentials",
  Google = "Google",
  Github = "Github",
  Facebook = "Facebook",
}

export type User = {
  id: string;
  username: string;
  email: string;
  provider: AccountProviders;
  emailVerified: boolean;
  hasPassword: boolean;
  createdAt: string;
  updatedAt: string;
};
