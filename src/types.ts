export type UserInput = {
  name: string;
  email: string;
  password: string;
  dateOfBirth: string;
  profession: string;
};

export type UserPayload = {
  name: string;
  id: number;
  email: string;
  profession: string;
  dateOfBirth: Date;
};

export type DatabaseUser = {
  name: string;
  email: string;
  password: string;
  dateOfBirth: Date;
  profession: string;
};

export type PagedUser = {
  name: string;
  email: string;
  dateOfBirth: string;
  profession: string;
  id: number;
};
