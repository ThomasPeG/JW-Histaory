import { addIcons } from 'ionicons';
import {
  homeOutline, home,
  businessOutline, business,
  calendarOutline, calendar,
  searchOutline, search,
  personAddOutline, personAdd,
  peopleOutline, people,
  bookmarkOutline, bookmark
} from 'ionicons/icons';

// Registra todos los iconos que se utilizan en la aplicación
export function registerIcons() {
  addIcons({
    // Iconos para el menú principal
    'home-outline': homeOutline,
    'home': home,
    'business-outline': businessOutline,
    'business': business,
    'calendar-outline': calendarOutline,
    'calendar': calendar,
    'search-outline': searchOutline,
    'search': search,
    'person-add-outline': personAddOutline,
    'person-add': personAdd,
    'people-outline': peopleOutline,
    'people': people,
    'bookmark-outline': bookmarkOutline,
    'bookmark': bookmark
  });
}