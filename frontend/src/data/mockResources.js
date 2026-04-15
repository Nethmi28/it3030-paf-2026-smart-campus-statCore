const generateSeries = (prefix, start, end, type, faculty, capacity, imageUrl) => {
  const series = [];
  for (let i = start; i <= end; i++) {
    series.push({
      id: `${prefix}${i}`,
      name: `${prefix}${i}`,
      type: type,
      faculty: faculty,
      location: `${faculty} Building, Floor ${String(i).charAt(0)}`,
      capacity: capacity,
      status: Math.random() > 0.1 ? 'Available' : 'Unavailable',
      imageUrl: imageUrl,
      amenities: type === 'LAB' ? ['Wi-Fi', 'Workstations', 'Air Conditioning'] : ['Wi-Fi', 'Projector', 'Sound System'],
    });
  }
  return series;
};

// Computing Images
const compLecImg = 'https://images.unsplash.com/photo-1541339907198-e08756edd811?auto=format&fit=crop&q=80&w=800';
const compLabImg = 'https://images.unsplash.com/photo-1581092918056-0c4c39378236?auto=format&fit=crop&q=80&w=800';

// Business Images
const busLecImg = 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=800';
const busLabImg = 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=800';

// Engineering Images
const engLecImg = 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800';
const engLabImg = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800';

// Arch Images
const arcLecImg = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800';
const arcLabImg = 'https://images.unsplash.com/photo-1503387762-592dee5814e?auto=format&fit=crop&q=80&w=800';

// Humanities Images
const humLecImg = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800';
const humLabImg = 'https://images.unsplash.com/photo-1513258496099-48168024adb0?auto=format&fit=crop&q=80&w=800';

export const MOCK_RESOURCES = [
  // Faculty of Computing - Series per user request
  ...generateSeries('A', 301, 306, 'LECTURE ROOM', 'Faculty of Computing', 120, compLecImg),
  ...generateSeries('A', 501, 505, 'LECTURE ROOM', 'Faculty of Computing', 240, compLecImg),
  ...generateSeries('B', 506, 507, 'LECTURE ROOM', 'Faculty of Computing', 60, compLecImg),
  ...generateSeries('A', 401, 412, 'LECTURE ROOM', 'Faculty of Computing', 120, compLecImg),
  ...generateSeries('F', 301, 315, 'LECTURE ROOM', 'Faculty of Computing', 60, compLecImg),
  ...generateSeries('F', 401, 406, 'LECTURE ROOM', 'Faculty of Computing', 240, compLecImg),
  ...generateSeries('F', 1301, 1307, 'LECTURE ROOM', 'Faculty of Computing', 120, compLecImg),
  ...generateSeries('G', 1301, 1307, 'LECTURE ROOM', 'Faculty of Computing', 120, compLecImg),
  ...generateSeries('CompLab', 1, 10, 'LAB', 'Faculty of Computing', 60, compLabImg),

  // Business School (BM) - 10 Lec, 10 Labs
  ...generateSeries('BM', 101, 110, 'LECTURE ROOM', 'Business School', 120, busLecImg),
  ...generateSeries('BMLab', 1, 10, 'LAB', 'Business School', 30, busLabImg),

  // Faculty of Engineering (E) - 10 Lec, 10 Labs
  ...generateSeries('E', 101, 110, 'LECTURE ROOM', 'Faculty of Engineering', 240, engLecImg),
  ...generateSeries('ELab', 1, 10, 'LAB', 'Faculty of Engineering', 60, engLabImg),

  // School of Architecture (ARC) - 10 Lec, 10 Labs
  ...generateSeries('ARC', 101, 110, 'LECTURE ROOM', 'School of architecture', 60, arcLecImg),
  ...generateSeries('ARCLab', 1, 10, 'LAB', 'School of architecture', 30, arcLabImg),

  // Faculty of Humanities & science (HS) - 10 Lec, 10 Labs
  ...generateSeries('HS', 101, 110, 'LECTURE ROOM', 'Faculty of Humanities & science', 120, humLecImg),
  ...generateSeries('HSLab', 1, 10, 'LAB', 'Faculty of Humanities & science', 60, humLabImg),

  // Global Resources
  {
    id: 'LIB01',
    name: 'Main Library - New Building',
    type: 'LIBRARY',
    faculty: 'General',
    location: 'Main Campus',
    capacity: 500,
    status: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=800',
    amenities: ['Quiet Zone', 'High-speed Wi-Fi', 'Computers'],
  },
  {
    id: 'AUD01',
    name: 'Main Auditorium',
    type: 'AUDITORIUM',
    faculty: 'General',
    location: 'Administrative Block',
    capacity: 500,
    status: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800',
    amenities: ['Full AV', 'Stage', 'Backstage'],
  },
  {
    id: 'AUD02',
    name: 'Mini Auditorium',
    type: 'AUDITORIUM',
    faculty: 'General',
    location: 'Student Union Building',
    capacity: 150,
    status: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800',
    amenities: ['Projector', 'Podium'],
  },
  {
    id: 'POOL01',
    name: 'Outdoor Swimming Pool',
    type: 'SPORTS',
    faculty: 'Student Services',
    location: 'Sports Complex',
    capacity: 100,
    status: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&q=80&w=800',
    amenities: ['Changing Rooms', 'Showers'],
  },
  {
    id: 'GYM01',
    name: 'Central Gym',
    type: 'SPORTS',
    faculty: 'Student Services',
    location: 'Sports Complex',
    capacity: 60,
    status: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800',
    amenities: ['Lockers', 'Water Station'],
  }
];

export const FACULTIES = [
  'Faculty of Computing',
  'Business School',
  'Faculty of Engineering',
  'School of architecture',
  'Faculty of Humanities & science'
];

export const CAPACITIES = [30, 60, 120, 240, 500];
