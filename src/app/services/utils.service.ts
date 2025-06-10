import { Injectable } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Amo, Visit } from '../models/formularios.model';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

  /**
   * Calcula los días restantes hasta la próxima visita
   * @param amo Objeto Amo del que se quiere calcular los días restantes
   * @param isPrimeraVisita Indica si es primera visita (true) o revisita (false)
   * @returns Número de días restantes o null si no hay fecha programada
   */
  getDiasRestantes(amo: Amo, isPrimeraVisita: boolean = false): number | null {
    if (!amo.visit || amo.visit.length === 0) {
      return null;
    }
    
    // Para primera visita usamos la primera visita, para revisita usamos la última
    const visitIndex = isPrimeraVisita ? 0 : amo.visit.length - 1;
    const visit = amo.visit[visitIndex];
    
    if (!visit || !visit.nextVisitDate) {
      return null;
    }
    
    const hoy = new Date();
    const proximaVisita = new Date(visit.nextVisitDate);
    
    // Resetear las horas para comparar solo fechas
    hoy.setHours(0, 0, 0, 0);
    proximaVisita.setHours(0, 0, 0, 0);
    
    // Calcular la diferencia en milisegundos y convertir a días
    const diferenciaMilisegundos = proximaVisita.getTime() - hoy.getTime();
    const diasRestantes = Math.ceil(diferenciaMilisegundos / (1000 * 60 * 60 * 24));
    
    return diasRestantes;
  }

  /**
   * Ordena los amos por fecha de próxima visita
   * @param amos Lista de amos a ordenar
   * @param isPrimeraVisita Indica si es primera visita (true) o revisita (false)
   * @returns Lista ordenada de amos
   */
  sortAmosByNextVisitDate(amos: Amo[], isPrimeraVisita: boolean = false): Amo[] {
    return [...amos].sort((a, b) => {
      // Para primera visita usamos la primera visita, para revisita usamos la última
      const visitIndexA = isPrimeraVisita ? 0 : (a.visit?.length || 1) - 1;
      const visitIndexB = isPrimeraVisita ? 0 : (b.visit?.length || 1) - 1;
      
      // Verificar si hay visitas y fechas de próxima visita
      const fechaA = a.visit && a.visit[visitIndexA] && a.visit[visitIndexA].nextVisitDate ? 
        new Date(a.visit[visitIndexA].nextVisitDate) : null;
      const fechaB = b.visit && b.visit[visitIndexB] && b.visit[visitIndexB].nextVisitDate ? 
        new Date(b.visit[visitIndexB].nextVisitDate) : null;
      
      // Si ambos tienen fecha, comparar normalmente
      if (fechaA && fechaB) {
        return fechaA.getTime() - fechaB.getTime();
      }
      
      // Si solo uno tiene fecha, ponerlo primero
      if (fechaA) return -1;
      if (fechaB) return 1;
      
      // Si ninguno tiene fecha, mantener el orden original
      return 0;
    });
  }

  /**
   * Determina la clase CSS según los días restantes
   * @param diasRestantes Número de días restantes o null
   * @returns Clase CSS correspondiente
   */
  getColorClase(diasRestantes: number | null): string {
    if (diasRestantes === null) {
      return 'sin-fecha';
    }
    
    if (diasRestantes < 2) {
      return 'dias-urgente'; // Rojo
    } else if (diasRestantes <= 7) {
      return 'dias-proximo'; // Amarillo
    } else {
      return 'dias-normal'; // Verde
    }
  }

  /**
   * Maneja el cambio en la opción "No programar" para la próxima visita
   * @param formControl Control del formulario para la fecha de próxima visita
   * @param skipNextVisit Indica si se debe omitir la próxima visita
   */
  toggleNextVisitDate(formControl: FormControl, skipNextVisit: boolean): void {
    if (skipNextVisit) {
      // Si se selecciona "No programar", eliminar la validación y establecer valor a null
      formControl.clearValidators();
      formControl.setValue(null);
    } else {
      // Si se deselecciona, restaurar la validación y establecer fecha por defecto
      formControl.setValidators(Validators.required);
      const manana = new Date();
      manana.setDate(manana.getDate() + 1);
      formControl.setValue(manana.toISOString());
    }
    
    formControl.updateValueAndValidity();
  }
}