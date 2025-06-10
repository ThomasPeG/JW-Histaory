import { addIcons } from 'ionicons';
import {
  homeOutline, home, homeSharp,
  businessOutline, business, businessSharp,
  calendarOutline, calendar, calendarSharp,
  searchOutline, search, searchSharp,
  personAddOutline, personAdd, personAddSharp,
  peopleOutline, people, peopleSharp,
  bookmarkOutline, bookmark, bookmarkSharp,
  chevronUp, chevronDown,
  addCircleOutline,
  createOutline,
  eyeOutline,
  close,
  closeOutline,
  personOutline,
  logOutOutline,
  helpCircleOutline,
  personSharp
} from 'ionicons/icons';

// Registra todos los iconos que se utilizan en la aplicación
export function registerIcons() {
  addIcons({
    // Iconos para el menú principal
    'home-outline': homeOutline,
    'home': home,
    'home-sharp': homeSharp,
    'business-outline': businessOutline,
    'business': business,
    'business-sharp': businessSharp,
    'calendar-outline': calendarOutline,
    'calendar': calendar,
    'calendar-sharp': calendarSharp,
    'search-outline': searchOutline,
    'search': search,
    'search-sharp': searchSharp,
    'person-add-outline': personAddOutline,
    'person-add': personAdd,
    'person-add-sharp': personAddSharp,
    'people-outline': peopleOutline,
    'people': people,
    'people-sharp': peopleSharp,
    'bookmark-outline': bookmarkOutline,
    'bookmark': bookmark,
    'bookmark-sharp': bookmarkSharp,
    // Add the chevron icons
    'chevron-up': chevronUp,
    'chevron-down': chevronDown,
    // Añadir los iconos faltantes
    'add-circle-outline': addCircleOutline,
    'create-outline': createOutline,
    'eye-outline': eyeOutline,
    'close': close,
    'close-outline': closeOutline,
    'person-outline': personOutline,
    'log-out-outline': logOutOutline,
    'help-circle-outline': helpCircleOutline,
    'person-sharp': personSharp,
  });
}