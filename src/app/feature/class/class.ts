import { Component, OnInit, signal } from '@angular/core';
import { ClassInterface } from '../../models/class.model';
import { Classservice } from '../../services/class/classservice';

@Component({
  selector: 'app-class',
  imports: [],
  templateUrl: './class.html',
  styleUrl: './class.css',
})
export class Class implements OnInit {
  classes = signal<ClassInterface[]>([]);

  constructor(private classservice: Classservice) {}
  ngOnInit(): void {
    this.loadClass();
  }

  // load class data
  loadClass() {
    this.classservice.getAllClasses().subscribe({
      next: (res) => {
        this.classes.set(res.data);
        console.log(this.classes());
      },
      error: (err) => {

      }
    })
  }
}
