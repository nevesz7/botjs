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
