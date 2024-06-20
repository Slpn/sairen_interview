import { Component } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {
  selectedFile: File | null = null;
  uploadProgress: number = 0;
  token: string | null = null;
  errorMessage: string | null = null;

  constructor(private http: HttpClient) {}

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.item(0);
    if (file) {
      this.selectedFile = file;
      this.errorMessage = null;
    }
  }

  onUpload(): void {
    const formData = new FormData();
    formData.append('file', this.selectedFile as File);
    this.http.post('http://localhost:3000/upload', formData, {
      reportProgress: true,
      observe: 'events',
      responseType: 'text',
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    }).subscribe({
      next: (event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round(100 * event.loaded / event.total);
        } else if (event.type === HttpEventType.Response) {
          console.log('Upload complete');
          this.errorMessage = null;
          this.uploadProgress = 0;
        }
      },
      error: (error) => {
        console.error('Error uploading file:', error);
        if (error.status === 403) {
          this.errorMessage = 'Invalid token. Please regenerate your token.';
        } else {
          this.errorMessage = 'An error occurred during file upload.';
        }
      }
    });
  }

  async getTokenPromise(): Promise<void> {
    try {
      const response = await firstValueFrom(this.http.get<{ token: string }>('http://localhost:3000/token'));
      this.token = response.token;
      console.log('Token received:', this.token);
    } catch (error) {
      console.error('Error fetching token:', error);
      this.errorMessage = 'Error fetching token. Please try again.';
    }
  }
  
}
