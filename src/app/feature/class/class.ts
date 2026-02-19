import { Component, inject, OnInit, signal } from '@angular/core';
import { ClassInterface } from '../../models/class.model';
import { Classservice } from '../../services/class/classservice';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../shared/toast/toast.service';
import { TextLoading } from '../../shared/text-loading/text-loading';
import { Toast } from '../../shared/toast/toast';

@Component({
  selector: 'app-class',
  imports: [CommonModule, FormsModule, TextLoading, Toast],
  templateUrl: './class.html',
  styleUrl: './class.css',
})
export class Class implements OnInit {
  protected readonly classService = inject(Classservice);
  protected readonly toastService = inject(ToastService);

  // class variable
  classes = signal<ClassInterface[]>([]);
  searchText: string = "";
  className: string = "";

  // update variable
  selectedClassName: string = "";
  selectedClassId: number = 0;

  // for edit
  loadingEdit = signal<boolean>(false);
  loadingCreate = signal<boolean>(false);

  constructor(private classservice: Classservice) {}
  ngOnInit(): void {
    this.loadClass();
  }

  // load class data
  loadClass() {
    this.classservice.getAllClasses(this.searchText).subscribe({
      next: (res) => {
        this.classes.set(res.data);
      },
      error: (err) => {
        this.classes.set(err.error.data || []);
        console.error('Error fetching classes:', err);
      }
    })
  }

  // create new subject
    createClass() {
      if (!this.className.trim()) {
        this.toastService.showToast('Class name cannot be empty', 'info');
        return;
      }
      this.loadingCreate.set(true);
  
      this.classService.createClass(this.className).subscribe({
        next: (res) => {
          setTimeout(() => {
            this.toastService.showToast(res.message, 'success');
            this.loadClass();
            this.loadingCreate.set(false);
            this.className = '';
          }, 3000);
        },
        error: (err) => {
          this.loadingCreate.set(false);
          console.error('Error creating subject:', err);
          this.toastService.showToast(err.error.message, 'danger');
        },
      });
    }
  
    // on delete subject
    onDeleteClass(c: ClassInterface) {
      if (
        confirm(
          `Are you sure you want to delete class ${c.class_name}?`,
        )
      ) {
        this.classService.deleteClass(c.class_id || 0).subscribe({
          next: (res) => {
            this.toastService.showToast(res.message, 'success');
            this.loadClass();
          },
          error: (err) => {
            this.toastService.showToast(err.error.message, 'danger');
            console.error('Error deleting class:', err);
          },
        });
      }
    }
  
    // on search subject
    onSearch() {
      this.loadClass();
    }
  
    // ##############
    // EDIT CLASS
    // ##############
    onSaveEdit() {
      this.loadingEdit.set(true);
      this.classService
        .updateClass(this.selectedClassId, this.selectedClassName)
        .subscribe({
          next: (res) => {
            setTimeout(() => {
              this.toastService.showToast(res.message, 'success');
              this.loadClass();
              this.cancelEdit();
              this.loadingEdit.set(false);
            }, 3000);
          },
          error: (err) => {
            this.loadingEdit.set(false);
            console.error('Error updating class:', err);
            this.toastService.showToast(err.error.message, 'danger');
          },
        });
    }
  
    editClass(c: ClassInterface) {
      this.selectedClassName = c.class_name;
      this.selectedClassId = c.class_id || 0;
    }
  
    isEdit(id: number): boolean {
      return this.selectedClassId === id;
    }
  
    cancelEdit() {
      this.selectedClassName = '';
      this.selectedClassId = 0;
    }
}
