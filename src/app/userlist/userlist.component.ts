import { Component } from '@angular/core';
import { Users } from '../Models/User';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
@Component({
  selector: 'app-userlist',
  standalone: true,
  imports: [TableModule, CardModule, ChartModule, ButtonModule, TooltipModule, ConfirmDialogModule],
  templateUrl: './userlist.component.html',
  styleUrl: './userlist.component.css',
  providers: [ConfirmationService]
})
export class UserlistComponent {
  users: Users[] = [];
  loading: boolean = true;
  PageSize: number = 5;
  chartData: any;
  chartOptions: any;
  sortDirections: { [key: string]: 'asc' | 'desc' } = { name: 'asc', price: 'asc' }; // T
  ChangeRoleURL = environment.Account.ChangeRoleURL;
  GetUsersURL = environment.Account.GetUsersURL;
  constructor(private http: HttpClient, private toastr: ToastrService, private confirmationService: ConfirmationService) { }
  ngOnInit() {
    this.FetchUsers();
  }
  FetchUsers() {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.loading = true;
    const role = localStorage.getItem('role') ?? "User";
    this.http.get<Users[]>(this.GetUsersURL, { headers, observe: 'response' }).subscribe({
      next: (response: any) => {
        if (response.body.statusCode != 200) {
          this.loading = false;
          this.showMessage(response.message || 'Something went wrong', 'error');
          return
        }
        // console.log(response);
        this.users = response.body.data;
        // console.log(this.users);
        const pagination = response.headers.get('pagination');
        this.loading = false;
      },
      error: (error) => {
        this.showMessage(error.message || 'Something went wrong', 'error');
        console.error('Error fetching Users:', error);
        this.loading = false;
      }
    });
  }
  showMessage(message: string, type: 'success' | 'error') {
    if (type === 'success') {
      this.toastr.success(message, 'Success');
    } else {
      this.toastr.error(message, 'Error');
    }
  }
  customSort1() {
    // Toggle sorting direction
    this.sortDirections['name'] = this.sortDirections['name'] === 'asc' ? 'desc' : 'asc';
    this.users = [...this.users].sort((a, b) => {
      return this.sortDirections['name'] === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    });
  }
  confirmupdate(email: string, role: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want yo change User Role?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.updaterole(email, role);
      },
      reject: () => {
      }
    });
  }
  updaterole(email: string, role: number) {
    const CurrentUserEmail = localStorage.getItem("email");

    if (email == CurrentUserEmail) {
      this.showMessage('You Can not change your role', 'error');
      return
    }
    const requestData = {
      email: email,
      role: role
    };
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.put(this.ChangeRoleURL, requestData, { headers }).subscribe({
      next: (response: any) => {
        if (response.statusCode != 200) {
          this.showMessage(response.message || 'Something went wrong', 'error');
          return
        }

        this.showMessage(response.message || 'Role Changed successfully', 'success');
        this.FetchUsers();
      },
      error: (error) => {
        console.error('Error Change Role:', error);
        this.showMessage(error.message || 'Something went wrong', 'error');
      }
    });
  }
}
