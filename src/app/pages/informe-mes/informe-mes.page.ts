import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatsService } from '../../services/stats.service';
import { MonthlyStats, YearlyStatsSummary } from '../../models/stats.model';

// Agregar al import de componentes
import { HelpDialogComponent } from '../../components/help-dialog/help-dialog.component';

@Component({
  selector: 'app-informe-mes',
  templateUrl: './informe-mes.page.html',
  styleUrls: ['./informe-mes.page.scss'],
  standalone: true,
  // Agregar a los imports del componente
  imports: [IonicModule, CommonModule, FormsModule, HelpDialogComponent]
})
export class InformeMesPage implements OnInit {
  // Variables para selección de fecha
  currentYear: number = new Date().getFullYear();
  currentMonth: number = new Date().getMonth() + 1; // JavaScript months are 0-indexed
  years: number[] = [];
  Math = Math;
  months: { value: number, name: string }[] = [
    { value: 1, name: 'Enero' },
    { value: 2, name: 'Febrero' },
    { value: 3, name: 'Marzo' },
    { value: 4, name: 'Abril' },
    { value: 5, name: 'Mayo' },
    { value: 6, name: 'Junio' },
    { value: 7, name: 'Julio' },
    { value: 8, name: 'Agosto' },
    { value: 9, name: 'Septiembre' },
    { value: 10, name: 'Octubre' },
    { value: 11, name: 'Noviembre' },
    { value: 12, name: 'Diciembre' }
  ];

  // Variables para estadísticas
  monthlyStats: MonthlyStats | null = null;
  //yearlyStats: YearlyStatsSummary | null = null;
  loading: boolean = false;
  error: string | null = null;

  constructor(private statsService: StatsService) {
    // Generar lista de años (desde 2020 hasta el año actual)
    const startYear = 2020;
    for (let year = startYear; year <= this.currentYear; year++) {
      this.years.push(year);
    }
  }

  ngOnInit() {
    this.loadStats();
  }

  // Cargar estadísticas mensuales y anuales
  loadStats() {
    this.loading = true;
    this.error = null;

    // Cargar estadísticas mensuales
    this.statsService.getMonthlyStats(this.currentYear, this.currentMonth).subscribe({
      next: (stats) => {
        console.log('Estadísticas mensuales cargadas:', stats);
        this.monthlyStats = stats;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar estadísticas mensuales:', err);
        this.error = 'No se pudieron cargar las estadísticas mensuales';
        this.loading = false;
      }
    });

    // Cargar estadísticas anuales
    // this.statsService.getYearlyStatsSummary(this.currentYear).subscribe({
    //   next: (stats) => {
    //     this.yearlyStats = stats;
    //   },
    //   error: (err) => {
    //     console.error('Error al cargar estadísticas anuales:', err);
    //     if (!this.error) {
    //       this.error = 'No se pudieron cargar las estadísticas anuales';
    //     }
    //   }
    // });
  }

  // Método para cambiar el mes o año seleccionado
  onDateChange() {
    this.loadStats();
  }

  // Agregar estas propiedades a la clase
  isHelpDialogOpen: boolean = false;
  helpContent: string = `
    <p><strong>¿Qué puedes hacer en esta página?</strong></p>
    <p>En esta página podrás visualizar y gestionar tus estadísticas mensuales de predicación.</p>
    <ul>
      <li><strong>Seleccionar Período:</strong> Elige el mes y año para ver las estadísticas.</li>
      <li><strong>Resumen:</strong> Visualiza el total de horas, revisitas, estudios y publicaciones.</li>
      <li><strong>Detalles de Visitas:</strong> Consulta la lista de todas las visitas realizadas en el mes.</li>
      <li><strong>Exportar:</strong> Genera un informe para compartir o guardar tus estadísticas.</li>
    </ul>
  `;
  
  // Agregar este método a la clase
  openHelpDialog() {
    this.isHelpDialogOpen = true;
  }
}
