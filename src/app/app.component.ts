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
  vaccineList:any[] = ["Pfizer", "Moderna", "Johnson & Johnson's"];
  employeeVal : boolean = false;
  locationList :any[] = [];
  states: any[] = [];
  maxDate: any;
  consentResultPop: any;
  countries: any[] = [];
  public cardObj: any = {}
  public vaccinedetails: any ;
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
  onFinalSubmit(lesson:any){
    const modalRef = this.modal.open(lesson);
    modalRef.componentInstance.lesson = lesson;
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
    this.cardObj = {}
    this.vaccinedetails = undefined
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
        ],
        vaccine: {
          "vaccineType" : "COVID-19",
          "manufacturer" : this.model.manufacturer,
          "doseDate" : this.model.vaccineDoseDate ? this.dateToRequest(this.model.vaccineDoseDate) : null,
          "vaccineCardFileName" : this.cardObj.fileName,
          "vaccineCardFile" : this.cardObj.file
        }
      }
      if(this.model.consentResult){
      this.emp.createEmployee(obj).subscribe((data) => {this.successCallBack(data)})
      }
    }
    else {
      this.model.consentResult = undefined
    }
    this.closeModal();
  }
  validate(){
    let df = this.model.dob
    let dateformat = /^(0?[1-9]|1[0-2])[\-](0?[1-9]|[1-2][0-9]|3[01])[\-]\d{4}$/;      
          
    // Match the date format through regular expression  
        
    if(df.match(dateformat)){   
      console.log("hii");
        let operator = df.split('-');
        let datepart:any[] = [];      
        if (operator.length>1){      
            datepart = df.split('-');      
        }      
        let month= parseInt(datepart[0]);      
        let day = parseInt(datepart[1]);      
        let year = parseInt(datepart[2]);      
        // Create list of days of a month      
        let ListofDays = [31,28,31,30,31,30,31,31,30,31,30,31];      
        if (month==1 || month>2){      
            if (day>ListofDays[month-1]){      
                ///This check is for Confirming that the date is not out of its range 
                this.toast.error("Date is not out of its range!", 'Error')     
                return false;      
            }      
        }else if (month==2){      
            let leapYear = false;      
            if ( (!(year % 4) && year % 100) || !(year % 400)) {      
                leapYear = true;      
            }      
            if ((leapYear == false) && (day>=29)){      
                return false;      
            }else      
            if ((leapYear==true) && (day>29)){      
                this.toast.error("Invalid date format!", 'Error')
                return false;      
            }      
        }
        this.model.dob = {year: parseInt(datepart[2]), month:parseInt(datepart[0]), day: parseInt(datepart[1])}    
    }else{
        console.log("Invalid date format!");  
        this.toast.error("Invalid date format!", 'Error')    
        return false;      
    } 
    return true;  
  }
  validateVacineDose(){
    let df = this.model.vaccineDoseDate
    let dateformat = /^(0?[1-9]|1[0-2])[\-](0?[1-9]|[1-2][0-9]|3[01])[\-]\d{4}$/;      
          
    // Match the date format through regular expression  
        
    if(df.match(dateformat)){   
      console.log("hii");
        let operator = df.split('-');
        let datepart:any[] = [];      
        if (operator.length>1){      
            datepart = df.split('-');      
        }      
        let month= parseInt(datepart[0]);      
        let day = parseInt(datepart[1]);      
        let year = parseInt(datepart[2]);      
        // Create list of days of a month      
        let ListofDays = [31,28,31,30,31,30,31,31,30,31,30,31];      
        if (month==1 || month>2){      
            if (day>ListofDays[month-1]){      
                ///This check is for Confirming that the date is not out of its range 
                this.toast.error("Date is not out of its range!", 'Error')     
                return false;      
            }      
        }else if (month==2){      
            let leapYear = false;      
            if ( (!(year % 4) && year % 100) || !(year % 400)) {      
                leapYear = true;      
            }      
            if ((leapYear == false) && (day>=29)){      
                return false;      
            }else      
            if ((leapYear==true) && (day>29)){      
                this.toast.error("Invalid date format!", 'Error')
                return false;      
            }      
        }
        this.model.vaccineDoseDate = {year: parseInt(datepart[2]), month:parseInt(datepart[0]), day: parseInt(datepart[1])}    
    }else{
        console.log("Invalid date format!");  
        this.toast.error("Invalid date format!", 'Error')    
        return false;      
    } 
    return true;  
  }
  isValidDate(year:any, month:any, day:any) {
    var d = new Date(year, month, day);
    if (d.getFullYear() == year && d.getMonth() == month && d.getDate() == day) {
        return true;
    }
    return false;
  }
  upload(files:any){
    console.log(files.target.files);
    let card = files.target.files[0];
    this.getBase64(card).then((data: any) => {
      const temp = {
          fileName: card.name,
          file: data.split(',')[1],
      };
      console.log(temp);
      this.cardObj = temp
  });
  }
  getBase64(file:any) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  handleChange(evt:any) {
    var target = evt.target.value;
    console.log(target);
    (target == 'yes' && this.model.company.vaccineRequired == 'true') ? this.vaccinedetails = true : this.vaccinedetails = false
    if(target == 'no'){
      this.toast.warning('Your company requires vaccine information', 'Warning');
    }
  }
}
