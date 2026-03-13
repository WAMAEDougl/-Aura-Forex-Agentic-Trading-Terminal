# Missing Logic Implementation Guide for Care Connect Hub

## Overview
This document outlines all the missing business logic that needs to be implemented in the care-connect-hub UI to make it fully functional with the hospital backend.

---

## 1. APPOINTMENTS PAGE - Missing Logic

### Current Issues:
- No API integration for creating appointments
- No real-time status updates
- No form validation
- No error handling
- No loading states

### Implementation Required:

```typescript
// Add to Appointments.tsx

// 1. State Management
const [appointments, setAppointments] = useState([]);
const [isLoading, setIsLoading] = useState(false);
const [formData, setFormData] = useState({
  patientId: '',
  doctorId: '',
  date: '',
  time: '',
  reason: '',
});

// 2. Load Appointments on Mount
useEffect(() => {
  loadAppointments();
}, [filterDoctor, filterStatus]);

const loadAppointments = async () => {
  try {
    setIsLoading(true);
    const data = await appointmentsService.getAll({
      doctorId: filterDoctor !== 'all' ? filterDoctor : undefined,
      status: filterStatus !== 'all' ? filterStatus : undefined,
    });
    setAppointments(data);
  } catch (error) {
    toast({ title: 'Error', description: 'Failed to load appointments', variant: 'destructive' });
  } finally {
    setIsLoading(false);
  }
};

// 3. Create Appointment Handler
const handleCreateAppointment = async () => {
  if (!formData.patientId || !formData.doctorId || !formData.date || !formData.time) {
    toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
    return;
  }

  try {
    setIsLoading(true);
    await appointmentsService.create(formData);
    toast({ title: 'Success', description: 'Appointment scheduled successfully' });
    setIsAddDialogOpen(false);
    setFormData({ patientId: '', doctorId: '', date: '', time: '', reason: '' });
    await loadAppointments();
  } catch (error) {
    toast({ title: 'Error', description: 'Failed to create appointment', variant: 'destructive' });
  } finally {
    setIsLoading(false);
  }
};

// 4. Update Appointment Status Handler
const handleStatusChange = async (appointmentId: string, newStatus: string) => {
  try {
    setIsLoading(true);
    await appointmentsService.updateStatus(appointmentId, newStatus);
    setAppointments(appointments.map(apt => 
      apt.id === appointmentId ? { ...apt, status: newStatus } : apt
    ));
    toast({ title: 'Success', description: `Appointment status updated to ${newStatus}` });
  } catch (error) {
    toast({ title: 'Error', description: 'Failed to update appointment', variant: 'destructive' });
  } finally {
    setIsLoading(false);
  }
};
```

---

## 2. PATIENTS PAGE - Missing Logic

### Current Issues:
- No API integration for patient registration
- No patient search functionality
- No patient detail view with full information
- No edit/delete functionality
- No validation

### Implementation Required:

```typescript
// Add to Patients.tsx

// 1. State Management
const [patients, setPatients] = useState([]);
const [isLoading, setIsLoading] = useState(false);
const [formData, setFormData] = useState({
  name: '',
  age: '',
  gender: 'male',
  phone: '',
  email: '',
  address: '',
  bloodGroup: 'O+',
  emergencyContact: '',
  emergencyPhone: '',
  insuranceId: '',
});

// 2. Load Patients on Mount
useEffect(() => {
  loadPatients();
}, [debouncedSearch]);

const loadPatients = async () => {
  try {
    setIsLoading(true);
    const data = await patientsService.getAll({
      search: debouncedSearch,
      limit: pageSize,
      offset: (currentPage - 1) * pageSize,
    });
    setPatients(data);
  } catch (error) {
    toast({ title: 'Error', description: 'Failed to load patients', variant: 'destructive' });
  } finally {
    setIsLoading(false);
  }
};

// 3. Register New Patient Handler
const handleAddPatient = async () => {
  if (!formData.name || !formData.age || !formData.phone || !formData.email) {
    toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
    return;
  }

  try {
    setIsLoading(true);
    await patientsService.create({
      ...formData,
      age: parseInt(formData.age),
    });
    toast({ title: 'Success', description: 'Patient registered successfully' });
    setIsAddDialogOpen(false);
    setFormData({ name: '', age: '', gender: 'male', phone: '', email: '', address: '', bloodGroup: 'O+', emergencyContact: '', emergencyPhone: '', insuranceId: '' });
    await loadPatients();
  } catch (error) {
    toast({ title: 'Error', description: 'Failed to register patient', variant: 'destructive' });
  } finally {
    setIsLoading(false);
  }
};

// 4. View Patient Details Handler
const handleViewPatient = async (patientId: string) => {
  try {
    const data = await patientsService.getById(patientId);
    setSelectedPatient(data);
  } catch (error) {
    toast({ title: 'Error', description: 'Failed to load patient details', variant: 'destructive' });
  }
};

// 5. Delete Patient Handler
const handleDeletePatient = async (patientId: string) => {
  if (!confirm('Are you sure you want to delete this patient?')) return;
  
  try {
    setIsLoading(true);
    await patientsService.delete(patientId);
    toast({ title: 'Success', description: 'Patient deleted successfully' });
    await loadPatients();
  } catch (error) {
    toast({ title: 'Error', description: 'Failed to delete patient', variant: 'destructive' });
  } finally {
    setIsLoading(false);
  }
};
```

---

## 3. BILLING PAGE - Missing Logic

### Current Issues:
- No API integration for invoices
- No payment processing
- No invoice generation
- No status filtering
- No real-time updates

### Implementation Required:

```typescript
// Add to Billing.tsx

// 1. State Management
const [invoices, setInvoices] = useState([]);
const [isLoading, setIsLoading] = useState(false);
const [formData, setFormData] = useState({
  patientId: '',
  description: '',
  amount: '',
  dueDate: '',
});

// 2. Load Invoices on Mount
useEffect(() => {
  loadInvoices();
}, [filterStatus]);

const loadInvoices = async () => {
  try {
    setIsLoading(true);
    const data = await billingService.getAll({
      status: filterStatus !== 'all' ? filterStatus : undefined,
    });
    setInvoices(data);
  } catch (error) {
    toast({ title: 'Error', description: 'Failed to load invoices', variant: 'destructive' });
  } finally {
    setIsLoading(false);
  }
};

// 3. Create Invoice Handler
const handleCreateInvoice = async () => {
  if (!formData.patientId || !formData.description || !formData.amount || !formData.dueDate) {
    toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
    return;
  }

  try {
    setIsLoading(true);
    await billingService.create({
      ...formData,
      amount: parseFloat(formData.amount),
    });
    toast({ title: 'Success', description: 'Invoice created successfully' });
    setIsAddDialogOpen(false);
    setFormData({ patientId: '', description: '', amount: '', dueDate: '' });
    await loadInvoices();
  } catch (error) {
    toast({ title: 'Error', description: 'Failed to create invoice', variant: 'destructive' });
  } finally {
    setIsLoading(false);
  }
};

// 4. Mark Invoice as Paid Handler
const handleMarkAsPaid = async (invoiceId: string) => {
  try {
    setIsLoading(true);
    await billingService.markAsPaid(invoiceId, 'cash');
    setInvoices(invoices.map(inv => 
      inv.id === invoiceId ? { ...inv, status: 'paid' } : inv
    ));
    toast({ title: 'Success', description: 'Invoice marked as paid' });
  } catch (error) {
    toast({ title: 'Error', description: 'Failed to mark invoice as paid', variant: 'destructive' });
  } finally {
    setIsLoading(false);
  }
};

// 5. Download Invoice PDF Handler
const handleDownloadPDF = async (invoiceId: string) => {
  try {
    const blob = await billingService.generatePDF(invoiceId);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoiceId}.pdf`;
    a.click();
  } catch (error) {
    toast({ title: 'Error', description: 'Failed to download invoice', variant: 'destructive' });
  }
};

// 6. Send Invoice Email Handler
const handleSendEmail = async (invoiceId: string, email: string) => {
  try {
    setIsLoading(true);
    await billingService.sendEmail(invoiceId, email);
    toast({ title: 'Success', description: 'Invoice sent to email' });
  } catch (error) {
    toast({ title: 'Error', description: 'Failed to send invoice', variant: 'destructive' });
  } finally {
    setIsLoading(false);
  }
};
```

---

## 4. DASHBOARD PAGE - Missing Logic

### Current Issues:
- Using mock data only
- No real-time statistics
- No API integration
- No refresh functionality
- No real-time notifications

### Implementation Required:

```typescript
// Add to Dashboard.tsx

// 1. State Management
const [stats, setStats] = useState(mockDashboardStats);
const [appointments, setAppointments] = useState([]);
const [isLoading, setIsLoading] = useState(false);

// 2. Load Dashboard Data on Mount
useEffect(() => {
  loadDashboardData();
  // Refresh every 30 seconds
  const interval = setInterval(loadDashboardData, 30000);
  return () => clearInterval(interval);
}, []);

const loadDashboardData = async () => {
  try {
    setIsLoading(true);
    const [statsData, appointmentsData] = await Promise.all([
      billingService.getStats(),
      appointmentsService.getAll({ status: 'pending' }),
    ]);
    setStats(statsData);
    setAppointments(appointmentsData);
  } catch (error) {
    console.error('Failed to load dashboard data', error);
  } finally {
    setIsLoading(false);
  }
};

// 3. Real-time Updates via WebSocket
useEffect(() => {
  const ws = new WebSocket('ws://localhost:3000');
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'appointment_created') {
      setAppointments(prev => [data.appointment, ...prev]);
      toast({ title: 'New Appointment', description: `${data.appointment.patientName} scheduled` });
    }
    if (data.type === 'invoice_paid') {
      toast({ title: 'Payment Received', description: `Invoice ${data.invoiceId} paid` });
    }
  };

  return () => ws.close();
}, []);
```

---

## 5. STAFF/HR PAGE - Missing Logic

### Current Issues:
- No staff management functionality
- No role-based access control
- No schedule management
- No performance tracking

### Implementation Required:

```typescript
// Create src/services/staff.service.ts

export const staffService = {
  async getAll() {
    const response = await api.get('/staff');
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/staff/${id}`);
    return response.data;
  },

  async create(data: any) {
    const response = await api.post('/staff', data);
    return response.data;
  },

  async update(id: string, data: any) {
    const response = await api.patch(`/staff/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/staff/${id}`);
    return response.data;
  },

  async getSchedule(id: string, date?: string) {
    const params = date ? `?date=${date}` : '';
    const response = await api.get(`/staff/${id}/schedule${params}`);
    return response.data;
  },
};
```

---

## 6. SETTINGS PAGE - Missing Logic

### Current Issues:
- No profile update functionality
- No password change
- No notification preferences
- No theme persistence

### Implementation Required:

```typescript
// Create src/services/settings.service.ts

export const settingsService = {
  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  async updateProfile(data: any) {
    const response = await api.patch('/auth/profile', data);
    return response.data;
  },

  async changePassword(oldPassword: string, newPassword: string) {
    const response = await api.post('/auth/change-password', {
      oldPassword,
      newPassword,
    });
    return response.data;
  },

  async getNotificationPreferences() {
    const response = await api.get('/settings/notifications');
    return response.data;
  },

  async updateNotificationPreferences(data: any) {
    const response = await api.patch('/settings/notifications', data);
    return response.data;
  },
};
```

---

## 7. BOOK CONSULTATION PAGE - Missing Logic

### Current Issues:
- No real booking functionality
- No payment integration
- No confirmation emails
- No calendar integration

### Implementation Required:

```typescript
// Add to BookConsultation.tsx

const handleBookConsultation = async (formData: any) => {
  try {
    setIsLoading(true);
    
    // 1. Create appointment
    const appointment = await appointmentsService.create({
      patientId: formData.patientId,
      doctorId: formData.doctorId,
      date: formData.date,
      time: formData.time,
      reason: formData.reason,
    });

    // 2. Create invoice if paid consultation
    if (formData.consultationFee) {
      await billingService.create({
        patientId: formData.patientId,
        description: `Consultation with ${formData.doctorName}`,
        amount: formData.consultationFee,
        dueDate: formData.date,
      });
    }

    // 3. Send confirmation email
    await api.post('/email/send-booking-confirmation', {
      patientEmail: formData.patientEmail,
      appointmentId: appointment.id,
    });

    toast({ title: 'Success', description: 'Consultation booked successfully' });
  } catch (error) {
    toast({ title: 'Error', description: 'Failed to book consultation', variant: 'destructive' });
  } finally {
    setIsLoading(false);
  }
};
```

---

## 8. REAL-TIME NOTIFICATIONS - Missing Logic

### Current Issues:
- No WebSocket connection
- No notification center
- No notification persistence
- No notification preferences

### Implementation Required:

```typescript
// Create src/hooks/use-notifications.tsx

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const ws = new WebSocket(import.meta.env.VITE_WEBSOCKET_URL);

    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      setNotifications(prev => [notification, ...prev]);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5000);
    };

    return () => ws.close();
  }, []);

  return notifications;
};
```

---

## 9. ERROR HANDLING & VALIDATION

### Add Global Error Handler:

```typescript
// Update src/lib/api.ts

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/';
    }
    if (error.response?.status === 403) {
      toast({ title: 'Access Denied', description: 'You do not have permission', variant: 'destructive' });
    }
    if (error.response?.status === 500) {
      toast({ title: 'Server Error', description: 'Something went wrong', variant: 'destructive' });
    }
    return Promise.reject(error);
  }
);
```

---

## 10. FORM VALIDATION

### Add Validation Utilities:

```typescript
// Create src/lib/validation.ts

export const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePhone = (phone: string) => {
  return /^\+?[\d\s\-()]{10,}$/.test(phone);
};

export const validateAge = (age: number) => {
  return age >= 0 && age <= 150;
};

export const validateDate = (date: string) => {
  return new Date(date) > new Date();
};
```

---

## Summary of Required Changes

1. **Appointments Page**: Add API integration, form handling, status updates
2. **Patients Page**: Add patient registration, search, view details
3. **Billing Page**: Add invoice creation, payment processing, PDF generation
4. **Dashboard**: Add real-time data loading, WebSocket integration
5. **Staff/HR**: Add staff management functionality
6. **Settings**: Add profile and preference management
7. **Book Consultation**: Add booking workflow with payment
8. **Notifications**: Add WebSocket-based real-time notifications
9. **Error Handling**: Add global error handling
10. **Validation**: Add form validation utilities

All service files have been created in `src/services/` directory and are ready to be integrated with the UI pages.
