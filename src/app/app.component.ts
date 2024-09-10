import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  title = 'tacer';
  receiptForm!: FormGroup;
  today!: string;
  downloadCart: any[] = [];
  todoList: any[] = [];

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit() {
    this.today = new Date().toISOString().split('T')[0];
    this.initializeForm();
    this.loadFiles();
  }

  initializeForm() {
    this.receiptForm = this.fb.group({
      randomId: [{ value: Date.now().toString(), disabled: true }, Validators.required],
      startDate: ['', [Validators.required, this.startDateValidator.bind(this)]],
      endDate: ['', [Validators.required, this.endDateValidator.bind(this)]],
      receiptDate: ['', [Validators.required, this.futureDateValidator.bind(this)]],
      fileUpload: [null, [Validators.required, this.fileValidator.bind(this)]]
    });

    this.receiptForm.controls['endDate'].valueChanges.subscribe(() => {
      this.receiptForm.controls['startDate'].updateValueAndValidity();
    });
  }

  // Custom validator for start date <= end date
  startDateValidator(control: { value: any }) {
    const startDate = control.value;
    const endDate = this.receiptForm ? this.receiptForm.controls['endDate'].value : null;
    return endDate && startDate > endDate ? { startDateInvalid: true } : null;
  }

  // Custom validator for end date <= today
  endDateValidator(control: { value: any }) {
    const endDate = control.value;
    return endDate && endDate > this.today ? { endDateInvalid: true } : null;
  }

  // Custom validator for receipt date <= today
  futureDateValidator(control: { value: any }) {
    const receiptDate = control.value;
    return receiptDate && receiptDate > this.today ? { futureDateInvalid: true } : null;
  }

  // Custom validator for file size and type
  fileValidator(control: { value: any }) {
    const file = control.value;
    if (!file) return null;

    const validTypes = ['application/pdf', 'image/jpeg', 'application/vnd.ms-excel'];
    if (!validTypes.includes(file.type)) return { fileTypeInvalid: true };

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) return { fileSizeInvalid: true };

    return null;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    this.receiptForm.patchValue({ fileUpload: file });
    this.receiptForm.get('fileUpload')?.updateValueAndValidity();
  }

  onSubmit() {
    if (this.receiptForm.valid) {
      const formData = new FormData();
      const formValues = this.receiptForm.getRawValue();

      formData.append('file', formValues.fileUpload);
      formData.append('randomId', formValues.randomId);
      formData.append('startDate', formValues.startDate);
      formData.append('endDate', formValues.endDate);
      formData.append('receiptDate', formValues.receiptDate);

      this.http.post('http://localhost:8080/api/upload', formData).subscribe(response => {
        console.log('File uploaded successfully:', response);
        alert("file uploaded suceessfully");
        this.loadFiles();
        this.receiptForm.reset();
        this.receiptForm.patchValue({ randomId: Date.now() });

        // Reset file input
        const fileInput: any = document.getElementById('fileUpload');
        if (fileInput) {
          fileInput.value = '';
        }
      });
    }
  }

  loadFiles() {
    this.http.get('http://localhost:8080/api/files').subscribe((data: any) => {
      this.todoList = data;
    });
  }

  addToDownloadCart(item: any) {
    if (!this.downloadCart.find(file => file.id === item.id)) {
      this.downloadCart.push(item);
    }
  }

  removeFromCart(index: number) {
    this.downloadCart.splice(index, 1);
  }

  downloadAllFiles() {
    const ids = this.downloadCart.map(file => file.id).join(',');
    this.http.get(`http://localhost:8080/api/download?ids=${ids}`, { responseType: 'blob' }).subscribe(blob => {
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'files.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      this.downloadCart = [];
    });
  }
}
