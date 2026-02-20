import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

// Chart.js
import {
  Chart,
  ChartConfiguration,
  ChartData,
  ChartOptions,
  registerables,
} from 'chart.js';
import { ReportService } from '../../services/report/report.service';
import { KpisInterface, LineChartInterface } from '../../models/report.model';
import { Classservice } from '../../services/class/classservice';
import { ClassInterface } from '../../models/class.model';
import { Toast } from '../../shared/toast/toast';
import { ToastService } from '../../shared/toast/toast.service';
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule, Toast],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {
  // inject service
  protected readonly reportService = inject(ReportService);
  protected readonly classService = inject(Classservice);
  protected readonly toastService = inject(ToastService);

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  kpiss = signal<KpisInterface[]>([]);
  chartData = signal<LineChartInterface>({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    p: [0, 0, 0, 0, 0, 0],
    a: [0, 0, 0, 0, 0, 0],
    ap: [0, 0, 0, 0, 0, 0],
    l: [0, 0, 0, 0, 0, 0],
  });

  // classes
  classes = signal<ClassInterface[]>([]);

  // select variable
  selectDate: Date = new Date();
  selectClassId: number = 0;

  // ----- Chart instances -----
  private chart?: Chart;

  ngOnInit(): void {
    this.loadAttendanceReport();
    this.loadKpis();
    this.loadClass();
  }

  async ngAfterViewInit(): Promise<void> {
    this.chartConfig();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  // -------------------------------
  // Filtering / KPI calc
  // -------------------------------
  private loadKpis(): void {
    this.reportService.getKpis().subscribe({
      next: (res) => {
        this.kpiss.set(res.data);
      },
    });
  }

  private loadAttendanceReport(): void {
    this.reportService
      .getAttendanceReport(this.selectClassId, String(this.selectDate))
      .subscribe({
        next: (res) => {
          this.chartData.set(res.data);
          this.updateChartData();
        },
      });
  }

  private loadClass(): void {
    this.classService.getAllClasses('').subscribe({
      next: (res) => {
        this.classes.set(res.data);
      },
    });
  }

  // -------------------------------
  // Charts
  // -------------------------------
  private chartConfig(): void {
    this.chart?.destroy();

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: this.chartData().labels,
        datasets: [
          {
            label: 'Present (P)',
            data: this.chartData().p,
            backgroundColor: '#22c55e68',
          },
          {
            label: 'Absent (A)',
            data: this.chartData().a,
            backgroundColor: '#ef444464',
          },
          {
            label: 'Permission (AP)',
            data: this.chartData().ap,
            backgroundColor: '#3b83f66c',
          },
          {
            label: 'Late (L)',
            data: this.chartData().l,
            backgroundColor: '#f59f0b65',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { position: 'bottom' } },
        scales: { y: { beginAtZero: true } },
      },
    });
  }

  private updateChartData(): void {
    if (!this.chart) return;

    this.chart.data.labels = this.chartData().labels;

    this.chart.data.datasets[0].data = this.chartData().p;
    this.chart.data.datasets[1].data = this.chartData().a;
    this.chart.data.datasets[2].data = this.chartData().ap;
    this.chart.data.datasets[3].data = this.chartData().l;

    this.chart.update();
  }

  // --------------
  // FILTER
  // --------------
  onDateChange() {
    const d = new Date(this.selectDate);
    this.toastService.showToast(
      `Change date to ${d.getDate()}-${d.getMonth()}-${d.getFullYear()}`,
      'info',
    );

    this.loadAttendanceReport();
  }

  onClassChange(): void {
    const className = this.classes()
    .find(c => c.class_id === Number(this.selectClassId))?.
    class_name;
    if(!className || this.selectClassId === 0) {
      this.toastService.showToast(`Switched to no class`, 'info');
    } else {
      this.toastService.showToast(`Switched to class ${className}`, 'info');
    }

    this.loadAttendanceReport();
  }
}
