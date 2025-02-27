import { CanActivateFn } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  console.log("Admin Gard");

  const role = localStorage.getItem('role');
  if (role == "Admin") {
    return true;
  }
  return false;
}

