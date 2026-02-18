import { Component, inject, OnInit, signal } from '@angular/core';
import { SubjectService } from '../../services/subject/subject.service';
import { SubjectInterface } from '../../models/subject.model';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../shared/toast/toast.service';
import { Toast } from '../../shared/toast/toast';
import { TextLoading } from '../../shared/text-loading/text-loading';

@Component({
  selector: 'app-subject',
  imports: [FormsModule, Toast, TextLoading],
  templateUrl: './subject.html',
  styleUrl: './subject.css',
})
export class Subject implements OnInit {
  // services
  protected readonly subjectService = inject(SubjectService);
  protected readonly toastService = inject(ToastService);

  // subject variable
  subjects = signal<SubjectInterface[]>([]);
  subjectName: string = '';
  searchText: string = '';

  // edit subject variable
  selectedSubjectName: string = '';
  selectedSubjectId: number = 0;

  // loading variable
  loading = signal<boolean>(false);
  loadingEdit = signal<boolean>(false);
  loadingCreate = signal<boolean>(false);

  ngOnInit(): void {
    this.loadSubjects();
  }

  // ##############
  // API CALLS
  // ##############
  loadSubjects() {
    this.subjectService.getAllSubjects(this.searchText).subscribe({
      next: (res) => {
        this.subjects.set(res.data);
      },
      error: (err) => {
        console.error('Error fetching subjects:', err);
      },
    });
  }

  // create new subject
  onCreateSubject() {
    if (!this.subjectName.trim()) {
      this.toastService.showToast('Subject name cannot be empty', 'info');
      return;
    }
    this.loadingCreate.set(true);

    this.subjectService.createSubject(this.subjectName).subscribe({
      next: (res) => {
        setTimeout(() => {
          this.toastService.showToast(res.message, 'success');
          this.loadSubjects();
          this.loadingCreate.set(false);
          this.subjectName = '';
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
  onDeleteSubject(subject: SubjectInterface) {
    if (
      confirm(
        `Are you sure you want to delete subject ${subject.subject_name}?`,
      )
    ) {
      this.subjectService.deleteSubject(subject.subject_id || 0).subscribe({
        next: (res) => {
          this.toastService.showToast(res.message, 'success');
          this.loadSubjects();
        },
        error: (err) => {
          this.toastService.showToast(err.error.message, 'danger');
          console.error('Error deleting subject:', err);
        },
      });
    }
  }

  // on search subject
  onSearch() {
    this.loadSubjects();
  }

  // ##############
  // EDIT SUBJECT
  // ##############
  onSaveEdit() {
    this.loadingEdit.set(true);
    this.subjectService
      .updateSubject(this.selectedSubjectId, this.selectedSubjectName)
      .subscribe({
        next: (res) => {
          setTimeout(() => {
            this.toastService.showToast(res.message, 'success');
            this.loadSubjects();
            this.cancelEdit();
            this.loadingEdit.set(false);
          }, 3000);
        },
        error: (err) => {
          this.loadingEdit.set(false);
          console.error('Error updating subject:', err);
          this.toastService.showToast(err.error.message, 'danger');
        },
      });
  }

  editSubject(subject: SubjectInterface) {
    this.selectedSubjectName = subject.subject_name;
    this.selectedSubjectId = subject.subject_id || 0;
  }

  isEdit(id: number): boolean {
    return this.selectedSubjectId === id;
  }

  cancelEdit() {
    this.selectedSubjectName = '';
    this.selectedSubjectId = 0;
  }
}
