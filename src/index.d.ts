import { User } from '@prisma/client';

declare global {
  interface LoggedUser extends User {}

  interface CreateParam<T> {
    postData: T;
    loggedUser: LoggedUser;
  }

  interface UpdateParam<T> {
    id: string;
    postData: T;
    loggedUser: LoggedUser;
  }

  interface DeleteParam {
    id: string;
    loggedUser: LoggedUser;
  }

  interface GetParam {
    id: string;
    loggedUser: LoggedUser;
  }
}
