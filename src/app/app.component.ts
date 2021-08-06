import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { EmployeeService } from './services/employee.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'kd-employee';
  model :any = {}
  raceList = ['Asian', 'Black', 'Caucasian', 'Hispanic', 'Native American', 'Other', 'N/A – Prefer not to Answer']
  sexList = ['Male','Female','Prefer not to Answer'];
  companyList :any[] = []
  consentResultList :any[] = ["Yes","No"];
  consentList :any[] = ["Only Me","Me and the Company Listed above"];
  employeeVal : boolean = false;
  locationList :any[] = [];
  states: any[] = [];
  maxDate: any;
  consentResultPop: any;
  countries: any[] = [];
  constructor(private toast : ToastrService,private emp : EmployeeService, private modal : NgbModal,){}

  ngOnInit(){
    this.model.responseCopy = false
    console.log(this.model.responseCopy + "hi");
    let obj = {'id':1}
    this.emp.getEmployees(obj).subscribe((data:any) => {
      this.companyList = data
    })
    this.emp.getCountryAndStates().subscribe((result: any) => {
      this.countries = result;
      this.model.country = this.countries[0]
      this.onContryChanged(this.model.country)
    });
    // this.states = this.emp.getStates()
    const date = new Date();
    const additionOfYears = 18;
    date.setFullYear(date.getFullYear() - additionOfYears); // For subtract use minus (-)
    console.log('New Date:', date);
    this.maxDate = this.dateToModel(new Date().toISOString())
    console.log(this.maxDate);
  }

  onContryChanged(country: any) {
    this.states = country.states;
  }

  onFormPage(){
    this.employeeVal = true
  }
  onFinalSubmit(){
    let reqObj = {
      "firstName": this.model.firstName,
      "lastName": this.model.lastName,
      "email": this.model.email,
      "phoneNumber": this.model.phoneNumber.length > 14
      ? this.model.phoneNumber.substring(0, this.model.phoneNumber.length - 1) : this.model.phoneNumber,
      "dateOfBirth":this.dateToRequest(this.model.dob),
      "race": this.model.race,
      "gender": this.model.sex,
      "address1":this.model.addressOne,
      "address2":this.model.addressTwo,
      "city": this.model.city,
      "zipCode": this.model.zipCode,
      "consentForResults": this.model.consentResult == true ? 'Yes' : 'No',
      "consent": this.model.consent,
      "byTypingMyInitials":this.model.initials,
      "state":this.model.state,
      "company": this.model.company.accountName,
      "sendMeACopy": this.model.responseCopy,
      "accountId": this.model.company.id,
      "locationId" : parseInt(this.model.loc)
    }

    let obj = {
      "dcId": 1,
      "orgId": this.model.company.id,
      "projectId": parseInt(this.model.loc),
      "suffix": "Mr",
      "firstName": this.model.firstName,
      "lastName": this.model.lastName,
      "middleName": "",
      "email":  this.model.email,
      "phone": this.model.phoneNumber.length > 14
      ? this.model.phoneNumber.substring(0, this.model.phoneNumber.length - 1) : this.model.phoneNumber,
      "dob": this.dateToRequest(this.model.dob),
      "race": this.model.race,
      "gender": this.model.sex,
      "homePhoneNumber": "",
      "drivingLicenseNumber": "",
      "drivingLicenseState": "",
      "consentResult": this.model.consent,
      "consent": this.model.consentResult == true ? 'Yes' : 'No',
      "byTypingMyInitials": this.model.initials,
      "sendMeACopy": this.model.responseCopy,
      "address": [
      {
        "addr1": this.model.addressOne,
        "addr2": this.model.addressTwo,
        "city": this.model.city,
        "zipcode": this.model.zipCode,
        "countryPhoneCode": this.model.country.phoneCode,
        "country": {
        "id": this.model.country.id,
        "countryName": this.model.country.countryName,
        },
        "state": this.model.state
      }
      ]
    }
    if(this.model.consentResult){
    this.emp.createEmployee(obj).subscribe((data) => {this.successCallBack(data)})
    }
  }
  successCallBack(data:any) {
    if(data.status == 'SUCCESS'){
    this.toast.success(data.message, 'Success')
    this.employeeVal = false
    this.model = {}
    this.locationList = []
    this.model.consentResult = undefined
    this.consentResultPop = undefined
    }else{
      this.toast.error(data.message, 'Error')
    }
  }
  dateToRequest(date:any){
    if(date.day <= 9 && date.month <= 9){
      return date.year+'-'+'0'+date.month+'-'+'0'+date.day
    }
    else if(date.day <= 9 && date.month > 9){
      return date.year+'-'+date.month+'-'+'0'+date.day
    }
    else if(date.month <= 9 && date.day > 9){
      return date.year+'-'+'0'+date.month+'-'+date.day
    }
    else{
    return date.year+'-'+date.month+'-'+date.day
    }
  }
  dateToModel(date : any){
    let d:any = (date.split('T')[0]).split('-')
    let obj:any= { "year": parseInt(d[0]), "month": parseInt(d[1]), "day": parseInt(d[2]) };
    return obj
  }
  onCompanyChange(data:any){
    console.log(data);
    this.locationList = this.model.company['totalProjects']
  }
  open(lesson: any) {
    const modalRef = this.modal.open(lesson);
    modalRef.componentInstance.lesson = lesson;
  }
  closeModal() {
    this.modal.dismissAll('Cross Click');
  }
  termsCond(){
    if(this.consentResultPop){
      this.model.consentResult = this.consentResultPop
    }
    else {
      this.model.consentResult = undefined
    }
    this.closeModal();
  }
}
